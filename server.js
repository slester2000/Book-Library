const express = require("express");
const path = require("path");
const Database = require("better-sqlite3");

const app = express();
const PORT = 3000;

/* -------------------- DATABASE -------------------- */

// Open SQLite database (sync + stable)
const dbPath = path.join(__dirname, "library.db");
const db = new Database(dbPath);

// Optional safety settings
db.pragma("foreign_keys = ON");

console.log("Connected to SQLite database at:", dbPath);

/* -------------------- MIDDLEWARE -------------------- */

// Parse JSON bodies
app.use(express.json());

// Attach DB to every request
app.use((req, res, next) => {
  req.db = db;
  next();
});

app.use(express.static("public"));
/* -------------------- ROUTES -------------------- */

const booksRouter = require("./routes/books");
const rentalsRouter = require("./routes/rentals");

app.use("/books", booksRouter);
app.use("/rentals", rentalsRouter);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

/* -------------------- ERROR HANDLING -------------------- */

// Catch unexpected errors (keeps server alive)
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED PROMISE REJECTION:", err);
});

/* -------------------- START SERVER -------------------- */

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});




