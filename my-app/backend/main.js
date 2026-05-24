import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import cateRoutes from "./routes/cateRoutes.js"
import budgetRoutes from "./routes/budgetRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";

import forgotRoutes
    from "./routes/forgotRoutes.js";


const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/cate", cateRoutes);
app.use("/api/budget", budgetRoutes);
app.use("/api/forget", forgotRoutes);
app.use("/api/reports", reportRoutes);
app.listen(3000, () => {
    console.log("Server chạy tại http://localhost:3000");
});