import pool from "../config/db.js";

export const findUserByEmail = async (email) => {
  const [rows] = await pool.query(
    "SELECT * FROM users WHERE email = ?", [email]
  );
  return rows[0];
};
export const createUser = async ({
  first_name,
  last_name,
  email,
  password
}) => {
  const [result] = await pool.query(
    `INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)`,
    [
      first_name,
      last_name,
      email,
      password
    ]
  );
  return result.insertId;
};

export const findUserById = async (
    id
) => {
    const [rows] = await pool.query(
        `
        SELECT
            first_name,
            last_name,
            password,
            last_change
        FROM users
        WHERE id = ?
        `,
        [id]
    );
    return rows[0];
}; 

export const updatePassword = async (
    id,
    hashedPassword
) => {

    await pool.query(
        `
        UPDATE users
        SET
            password = ?,
            last_change = NOW()
        WHERE id = ?
        `,
        [hashedPassword, id]
    );
};