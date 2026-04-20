const { Pool } = require("pg");
const mongoose = require("mongoose");

const pool = new Pool({
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
});

const connectPostgres = async () => {
  try {
    await pool.query("SELECT NOW()");
    console.log("PostgreSQL connected");
  } catch (error) {
    console.log("PostgreSQL connection error:", error.message);
    throw error;
  }
};

const connectMongo = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
  } catch (error) {
    console.log("MongoDB connection error:", error.message);
    throw error;
  }
};

module.exports = {
  pool,
  connectPostgres,
  connectMongo,
};

