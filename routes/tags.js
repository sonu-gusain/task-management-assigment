const express = require("express");
const Tag = require("../models/tagModel");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// CREATE TAG
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Tag name is required" });
    }

    const existingTag = await Tag.findOne({
      name: name.trim(),
      userId: req.user.id,
    });

    if (existingTag) {
      return res.status(400).json({ message: "Tag already exists" });
    }

    const tag = await Tag.create({
      name: name.trim(),
      userId: req.user.id,
    });

    res.status(201).json({
      message: "Tag created successfully",
      tag,
    });
  } catch (error) {
    console.log("Create tag error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// GET ALL TAGS
router.get("/", authMiddleware, async (req, res) => {
  try {
    const tags = await Tag.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });

    res.status(200).json(tags);
  } catch (error) {
    console.log("Get tags error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// GET SINGLE TAG
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const tag = await Tag.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!tag) {
      return res.status(404).json({ message: "Tag not found" });
    }

    res.status(200).json(tag);
  } catch (error) {
    console.log("Get single tag error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// UPDATE TAG
router.patch("/:id", authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Tag name is required" });
    }

    const updatedTag = await Tag.findOneAndUpdate(
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

    if (!updatedTag) {
      return res.status(404).json({
        message: "Tag not found or unauthorized",
      });
    }

    res.status(200).json({
      message: "Tag updated successfully",
      tag: updatedTag,
    });
  } catch (error) {
    console.log("Update tag error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE TAG
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const deletedTag = await Tag.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!deletedTag) {
      return res.status(404).json({
        message: "Tag not found or unauthorized",
      });
    }

    res.status(200).json({
      message: "Tag deleted successfully",
    });
  } catch (error) {
    console.log("Delete tag error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
