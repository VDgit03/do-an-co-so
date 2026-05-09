import express from "express";
import { register } from "../controllers/auth/registerController.js";
import { login } from "../controllers/auth/loginController.js";
import { googleLogin } from "../controllers/auth/googleController.js";
import { getUser } from "../controllers/user/userController.js";
const router = express.Router();

// đăng kí, đăng nhập
router.post("/register", register);
router.post("/login", login);
router.post("/google", googleLogin);

// lấy tên
router.get("/user/:id", getUser);
export default router;