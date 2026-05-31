import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import forgotRoutes from "./routes/forgotRoutes.js";
import cateRoutes from "./routes/cateRoutes.js"
import budgetRoutes from "./routes/budgetRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import goalRoutes from "./routes/goalsRoutes.js";
import walletRoutes from "./routes/walletRoutes.js"
import aiRoutes from "./routes/AIRoutes.js";

import transactionRoutes from "./routes/transactionRoutes.js";



const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/cate", cateRoutes);
app.use("/api/budget", budgetRoutes);
app.use("/api/forget", forgotRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/transaction", transactionRoutes)
app.use("/api/ai", aiRoutes);
app.listen(3000, () => {
    console.log("Server chạy tại http://localhost:3000");
});