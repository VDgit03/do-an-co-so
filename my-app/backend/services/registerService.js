import bcrypt from "bcrypt";
import db from "../config/db.js";

export const registerService = async ({
  first_name,
  last_name,
  email,
  password,
}) => {

  // check email tồn tại
  const [rows] = await db.execute(
    "SELECT * FROM users WHERE email = ?",
    [email]
  );

  if (rows.length > 0) {
    throw new Error("Email đã tồn tại");
  }

  // hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // insert DB
  const [result] = await db.execute(
    "INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)",
    [first_name, last_name, email, hashedPassword]
  );

  // return user
  return {
    id: result.insertId,
    first_name,
    last_name,
    email,
  };
};