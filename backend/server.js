const express = require("express");
const app = express();
const db = require("./database");

app.get("/", (req, res) => {
  res.send("MLB Analytics API is running ⚾");
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});