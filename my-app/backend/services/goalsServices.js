import express from "express";
import cors from "cors";

import goalRoutes from "../routes/goalsRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/goals", goalRoutes);

app.listen(3000, () => {
    console.log("Server chạy tại http://localhost:3000");
});