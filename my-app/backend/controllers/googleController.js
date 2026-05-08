import { OAuth2Client } from "google-auth-library";
import db from "../config/db.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    console.log("GOOGLE TOKEN:", token);

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    console.log("GOOGLE PAYLOAD:", payload);

    const email = payload.email;
    const first_name = payload.given_name || "";
    const last_name = payload.family_name || "";

    const [rows] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    let user;

    if (rows.length === 0) {
      const [result] = await db.query(
        "INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, '')",
        [first_name, last_name, email]
      );

      user = { id: result.insertId, email };
    } else {
      user = rows[0];
    }

    const appToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.json({
      token: appToken,
      user,
    });

  } catch (err) {
    return res.status(500).json({
      message: "Google login failed",
      error: err.message
    });
  }
};