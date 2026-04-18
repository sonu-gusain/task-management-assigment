const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { pool } = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();


// EMAIL VALIDATION FUNCTION

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};


// REGISTER 
 
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    // validation

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

//    check existing user

    const userExist = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (userExist.rows.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

//   hash password

    const hashedPassword = await bcrypt.hash(password, 10);

 //    insert user

    const newUser = await pool.query(
      "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email",
      [email, hashedPassword]
    );

    res.status(201).json({
      message: "User registered successfully",
      user: newUser.rows[0],
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});


//   LOGIN  


router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    //  validation
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    //  find user
    const userResult = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = userResult.rows[0];

    //  compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    //   JWT TOKEN
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    res.status(200).json({
      message: "Login successful",
      token,
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});


//  PROFILE 


router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await pool.query(
      "SELECT id, email, created_at FROM users WHERE id = $1",
      [req.user.id]
    );

    res.status(200).json(user.rows[0]);

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
