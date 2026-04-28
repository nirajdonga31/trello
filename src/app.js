const express = require("express");
const boardRoutes = require("./routes/boards");
const cardRoutes = require("./routes/cards");

const app = express();
const allowedOrigin = process.env.CORS_ORIGIN || "*";

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", allowedOrigin);
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");

  if (req.method === "OPTIONS") {
    return res.status(204).send();
  }

  next();
});
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.use(boardRoutes);
app.use(cardRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

module.exports = app;
