const express = require("express");
const router = express.Router();

/**
 * GET /books
 * Returns all books
 */
router.get("/", (req, res) => {
  try {
    const books = req.db
      .prepare("SELECT id, title, total_copies, available_copies, is_active FROM books ORDER BY title")
      .all();

    res.json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /books
 * Add a new book
 */
router.post("/", (req, res) => {
  try {
    const { title, author, isbn, total_copies } = req.body;

    if (!title || total_copies == null) {
      return res.status(400).json({ error: "Title and total copies required" });
    }

    const stmt = req.db.prepare(`
      INSERT INTO books (title, author, isbn, total_copies, available_copies)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      title,
      author || null,
      isbn || null,
      Number(total_copies),
      Number(total_copies)
    );

    res.json({ id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /books/:id
 * Update book details
 */
router.put("/:id", (req, res) => {
  try {
    const { title, author, isbn, total_copies, is_active } = req.body;

    const stmt = req.db.prepare(`
      UPDATE books
      SET title = ?, author = ?, isbn = ?, total_copies = ?, is_active = ?
      WHERE id = ?
    `);

    stmt.run(
      title,
      author || null,
      isbn || null,
      Number(total_copies),
      Number(is_active),
      req.params.id
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * PATCH /books/:id/deactivate
 * Soft delete a book
 */
router.patch("/:id/deactivate", (req, res) => {
  try {
    req.db
      .prepare("UPDATE books SET is_active = 0 WHERE id = ?")
      .run(req.params.id);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



module.exports = router;
