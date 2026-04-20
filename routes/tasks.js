

const express = require("express");
const mongoose = require("mongoose");
const Task = require("../models/mongoschema");
const authMiddleware = require("../middleware/authMiddleware");
const {
  scheduleReminder,
  cancelReminder,
  rescheduleReminder,
} = require("../services/reminderService");
const { sendWebhook } = require("../services/webhookService");

const router = express.Router();

// CREATE TASK
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, description, dueDate, status, categoryId, tags } = req.body;

    if (!title || !dueDate) {
      return res.status(400).json({
        message: "Title and dueDate are required",
      });
    }

    if (title.trim() === "") {
      return res.status(400).json({
        message: "Title cannot be empty",
      });
    }

    const validStatuses = ["pending", "completed"];

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Status must be pending or completed",
      });
    }

    const parsedDate = new Date(dueDate);

    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        message: "Invalid dueDate format",
      });
    }

    if (categoryId !== undefined && categoryId !== null && categoryId !== "") {
      if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        return res.status(400).json({
          message: "Invalid categoryId",
        });
      }
    }

    if (tags !== undefined && !Array.isArray(tags)) {
      return res.status(400).json({
        message: "Tags must be an array",
      });
    }

    const cleanedTags = Array.isArray(tags)
      ? tags
          .filter((tag) => typeof tag === "string" && tag.trim() !== "")
          .map((tag) => tag.trim())
      : [];

    const finalStatus = status || "pending";

    const task = await Task.create({
      title: title.trim(),
      description: description ? description.trim() : "",
      dueDate: parsedDate,
      status: finalStatus,
      userId: req.user.id,
      categoryId: categoryId || null,
      tags: cleanedTags,
      completedAt: finalStatus === "completed" ? new Date() : null,
    });

    scheduleReminder(task);

    res.status(201).json({
      message: "Task created successfully",
      task,
    });
  } catch (error) {
    console.log("Create task error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// GET ALL TASKS + FILTER
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { categoryId, tags, status } = req.query;

    const query = {
      userId: req.user.id,
    };

    if (categoryId) {
      if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        return res.status(400).json({
          message: "Invalid categoryId",
        });
      }
      query.categoryId = categoryId;
    }

    if (status) {
      const validStatuses = ["pending", "completed"];

      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          message: "Status must be pending or completed",
        });
      }

      query.status = status;
    }

    if (tags) {
      const tagList = tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag !== "");

      if (tagList.length > 0) {
        query.tags = { $in: tagList };
      }
    }

    const tasks = await Task.find(query).sort({
      createdAt: -1,
    });

    res.status(200).json(tasks);
  } catch (error) {
    console.log("Get all tasks error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// GET SINGLE TASK
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid task id" });
    }

    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json(task);
  } catch (error) {
    console.log("Get single task error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});


// UPDATE TASK
router.patch("/:id", authMiddleware, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid task id" });
    }

    const existingTask = await Task.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!existingTask) {
      return res.status(404).json({
        message: "Task not found or unauthorized",
      });
    }

    const { title, description, dueDate, status, categoryId, tags } = req.body;

    const updateData = {};

    if (title !== undefined) {
      if (typeof title !== "string" || title.trim() === "") {
        return res.status(400).json({ message: "Title cannot be empty" });
      }
      updateData.title = title.trim();
    }

    if (description !== undefined) {
      updateData.description =
        typeof description === "string" ? description.trim() : "";
    }

    if (dueDate !== undefined) {
      const parsedDate = new Date(dueDate);

      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({ message: "Invalid dueDate format" });
      }

      updateData.dueDate = parsedDate;
    }

    if (status !== undefined) {
      const validStatuses = ["pending", "completed"];

      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          message: "Status must be pending or completed",
        });
      }

      updateData.status = status;
      updateData.completedAt = status === "completed" ? new Date() : null;
    }

    if (categoryId !== undefined) {
      if (categoryId === null || categoryId === "") {
        updateData.categoryId = null;
      } else {
        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
          return res.status(400).json({
            message: "Invalid categoryId",
          });
        }
        updateData.categoryId = categoryId;
      }
    }

    if (tags !== undefined) {
      if (!Array.isArray(tags)) {
        return res.status(400).json({
          message: "Tags must be an array",
        });
      }

      updateData.tags = tags
        .filter((tag) => typeof tag === "string" && tag.trim() !== "")
        .map((tag) => tag.trim());
    }

    const updatedTask = await Task.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user.id,
      },
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedTask) {
      return res.status(404).json({
        message: "Task not found or unauthorized",
      });
    }

    if (existingTask.status !== "completed" && updatedTask.status === "completed") {
      cancelReminder(updatedTask._id);
      sendWebhook(updatedTask);
    } else if (updatedTask.status !== "completed") {
      rescheduleReminder(updatedTask);
    }

    res.status(200).json({
      message: "Task updated successfully",
      task: updatedTask,
    });
  } catch (error) {
    console.log("Update task error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE TASK
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid task id" });
    }

    const deletedTask = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!deletedTask) {
      return res.status(404).json({
        message: "Task not found or unauthorized",
      });
    }

    cancelReminder(deletedTask._id);

    res.status(200).json({
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.log("Delete task error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

