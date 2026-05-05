import express from "express";
import { register } from "../controllers/registerController.js";
import { login } from "../controllers/loginController.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

export default router;