# naveen gusain 

##  Demo Video

Watch the project demo here:  https://drive.google.com/file/d/1dMIXP2OqMjSXlCBpNyA_4Xvqe_PSMAA6/view?usp=drive_link


#  Task Management API

##  Overview

This is a backend API for a **Task Management Application** built using **Node.js and Express.js**.

It allows users to:

* Register and Login securely
* Manage tasks (Create, Read, Update, Delete)
* Access only their own tasks

---

##  Tech Stack

* Node.js
* Express.js
* PostgreSQL (for Users)
* MongoDB (for Tasks)
* JWT Authentication
* bcryptjs
* dotenv

---

##  Folder Structure

```
task-api/
│
├── config/
│   └── db.js
│
├── models/
│   └── mongoschema.js
│
├── routes/
│   ├── auth.js
│   └── tasks.js
│
├── middleware/
│   └── authMiddleware.js
│
├── .env
├── server.js
├── package.json
└── README.md
```

---

##  Setup Instructions

### 1. Clone the repository

```
git clone 
cd task-api
```

---

### 2. Install dependencies

```
npm install
```

---

### 3. Create `.env` file

```
PORT=5000

PG_HOST=localhost
PG_PORT=5432
PG_USER=postgres
PG_PASSWORD=your_password
PG_DATABASE=task_management

MONGO_URI=mongodb://127.0.0.1:27017/task_management

JWT_SECRET=your_secret_key
```

---

### 4. Setup PostgreSQL Database

Run this SQL query:

```
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

### 5. Run the server

```
npm run dev
```

---

##  Authentication

* JWT is used for authentication
* After login, a token is generated
* Use token in headers:

```
Authorization: Bearer <your_token>
```

---

##  API Endpoints

###  Auth APIs

#### Register

```
POST /api/auth/register
```

#### Login

```
POST /api/auth/login





#### Profile

```
GET /api/auth/profile
```

---

###  Task APIs

#### Create Task

```
POST /api/tasks
```

#### Get All Tasks

```
GET /api/tasks
```

#### Get Single Task

```
GET /api/tasks/:id
```

#### Update Task

```
PATCH /api/tasks/:id
```

###  Delete Task

```
DELETE /api/tasks/:id
```

---

##  Security Features

* Password hashing using bcrypt
* JWT-based authentication
* Protected routes
* User-specific task access (no cross-user access)

---

##  Validation

* Email format validation
* Password length validation
* Task status validation (pending/completed)
* Due date validation


---

##  Design Decisions

* PostgreSQL used for structured user data
* MongoDB used for flexible task storage
* JWT used for stateless authentication
* Clean and modular folder structure


