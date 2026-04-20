# naveen gusain 

##  Demo Video

Watch the project demo here: https://drive.google.com/file/d/192UWlUGyfFYAvti9Sgg4Qb8F4LGpovxL/view?usp=drive_link



# Task Management API (Assignment 3)

## Overview

This project is a Task Management API built using Node.js and Express.js. It provides functionality for user authentication, task management, categorization, tagging, reminder scheduling, and webhook integration.

The system allows users to create, update, and manage tasks efficiently, along with simulated real-time notifications and external service communication.

---
## Project Structure

Maveen_assignment3/
│
├── config/
│   ├── mongo.js
│   └── postgres.js
│
├── middleware/
│   └── authMiddleware.js
│
├── models/
│   ├── Task.js
│   ├── Category.js
│   └── Tag.js
│
├── routes/
│   ├── auth.js
│   ├── tasks.js
│   ├── categories.js
│   └── tags.js
│
├── services/
│   ├── reminderService.js
│   └── webhookService.js
│
├── .env
├── package.json
├── package-lock.json
├── server.js
└── README.md


## Tech Stack

- Node.js
- Express.js
- MongoDB (for tasks, categories, tags)
- PostgreSQL (for user authentication)
- JSON Web Token (JWT)
- bcrypt.js
- dotenv
- axios
- In-memory scheduling using setTimeout

---

## Features

### Authentication

- User registration
- User login
- JWT-based authentication
- Protected routes

---

### Task Management

- Create task
- Get all tasks
- Get single task
- Update task
- Delete task

---

### Categories

- Create category
- Get all categories
- Get single category
- Update category
- Delete category

---

### Tags

- Multiple tags can be assigned to a task
- Tags are implemented as free-form text (array of strings)

---

### Filtering

- Filter tasks by category
- Filter tasks by tags
- Filter tasks by status
- Combined filtering supported

Example:

GET /api/tasks?categoryId=category_id&tags=Urgent&status=pending

---

## Reminder System

- When a task is created or updated with a dueDate, a reminder is scheduled
- The reminder triggers 1 hour before the due date
- Implemented using in-memory scheduling with setTimeout
- Reminder is logged to the console

### Behavior

- On dueDate update → reminder is rescheduled
- On task completion → reminder is cancelled
- On task deletion → reminder is cancelled

### Note

This is an in-memory solution. Reminders are not persistent and will be lost if the server restarts. In production, tools like BullMQ with Redis can be used.

---

## Webhook Integration

- When task status changes to "completed", a POST request is sent to an external webhook
- Webhook URL is configurable using environment variables

### Payload Example

```json
{
  "taskId": "task_id",
  "title": "Task Title",
  "userId": "user_id",
  "completedAt": "timestamp"
}


