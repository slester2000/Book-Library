const express = require("express");
const router = express.Router();

/**
 * GET /books
 * Returns all books
 */
router.get("/", (req, res) => {
  try {
    const books = req.db
      .prepare("SELECT id, title, total_copies, available_copies FROM books ORDER BY title")
      .all();

    res.json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
