import express from "express";
import { register } from "../controllers/registerController.js";
import { login } from "../controllers/loginController.js";
import { googleLogin } from "../controllers/googleController.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleLogin);

export default router;