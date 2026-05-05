import pool from "../config/db.js";

export const findUserByEmail = async (email) => {
  const [rows] = await pool.query(
    "SELECT * FROM users WHERE email = ?",
    [email]
  );
  return rows[0];
};

export const createUser = async (user) => {
  const { first_name, last_name, email, password } = user;

  const [result] = await pool.query(
    "INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)",
    [first_name, last_name, email, password]
  );

  return result.insertId;
};