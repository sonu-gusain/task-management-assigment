require("dotenv").config();
const express = require("express");
const { connectPostgres, connectMongo } = require("./config/db");

const authRoutes = require("./routes/auth");
const taskRoutes = require("./routes/tasks");

const app = express();

app.use(express.json());

// test route

app.get("/", (req, res) => {
  res.json({ message: "API running successfully" });
});

// routes

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

const startServer = async () => {
  try {
    await connectPostgres();
    await connectMongo();

    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  } catch (error) {
    console.log("Server error:", error.message);
  }
};

startServer();
