const express = require("express");
const Category = require("../models/categoryModel");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();


// CREATE CATEGORY
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Category name is required" });
    }

    const existingCategory = await Category.findOne({
      name: name.trim(),
      userId: req.user.id,
    });

    if (existingCategory) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const category = await Category.create({
      name: name.trim(),
      userId: req.user.id,
    });

    res.status(201).json({
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    console.log("Create category error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});


// GET ALL CATEGORIES
router.get("/", authMiddleware, async (req, res) => {
  try {
    const categories = await Category.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });

    res.status(200).json(categories);
  } catch (error) {
    console.log("Get categories error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});


// GET SINGLE CATEGORY
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json(category);
  } catch (error) {
    console.log("Get single category error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});


// UPDATE CATEGORY
router.patch("/:id", authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Category name is required" });
    }

    const category = await Category.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user.id,
      },
      {
        name: name.trim(),
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!category) {
      return res.status(404).json({
        message: "Category not found or unauthorized",
      });
    }

    res.status(200).json({
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    console.log("Update category error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});


// DELETE CATEGORY
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const category = await Category.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!category) {
      return res.status(404).json({
        message: "Category not found or unauthorized",
      });
    }

    res.status(200).json({
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.log("Delete category error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;