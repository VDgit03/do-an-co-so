import express from "express";
app.use(express.static("public"));
const app = express();

app.get("/", (req, res) => {
  res.send("Server đang chạy 🚀");
});

app.listen(3000, () => {
  console.log("http://localhost:3000");
});