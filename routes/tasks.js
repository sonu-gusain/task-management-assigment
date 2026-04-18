const express = require("express");
const Task = require("../models/mongoschema");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

//  CREATE TASK =


router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, description, dueDate, status } = req.body;

    if (!title || !dueDate) {
      return res.status(400).json({
        message: "Title and dueDate are required",
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

    const task = await Task.create({
      title,
      description,
      dueDate: parsedDate,
      status,
      userId: req.user.id,
    });

    res.status(201).json({
      message: "Task created successfully",
      task,
    });
  } catch (error) {
    console.log("Create task error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});



//  GET ALL TASKS 

router.get("/", authMiddleware, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user.id }).sort({
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


//   UPDATE TASK 


router.patch("/:id", authMiddleware, async (req, res) => {
  try {
    const { title, description, dueDate, status } = req.body;

    const updateData = {};

    if (title !== undefined) {
      if (title.trim() === "") {
        return res.status(400).json({ message: "Title cannot be empty" });
      }
      updateData.title = title;
    }

    if (description !== undefined) {
      updateData.description = description;
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

    res.status(200).json({
      message: "Task updated successfully",
      task: updatedTask,
    });
  } catch (error) {
    console.log("Update task error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

//  DELETE TASK 


router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const deletedTask = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!deletedTask) {
      return res.status(404).json({
        message: "Task not found or unauthorized",
      });
    }

    res.status(200).json({
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.log("Delete task error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
