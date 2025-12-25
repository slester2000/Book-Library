const express = require("express");
const router = express.Router();

/**
 * GET /rentals
 * Returns all rentals (past + present)
 */
router.get("/", (req, res) => {
  try {
    const rentals = req.db
      .prepare(`
        SELECT
          rentals.id AS rental_id,
          rentals.renter_name,
          rentals.checkout_date,
          rentals.due_date,
          rentals.return_date,
          books.id AS book_id,
          books.title
        FROM rentals
        JOIN books ON rentals.book_id = books.id
        ORDER BY rentals.checkout_date DESC
      `)
      .all();

    res.json(rentals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /rentals/active
 * Returns only currently checked-out rentals
 */
router.get("/active", (req, res) => {
  try {
    const rentals = req.db
      .prepare(`
        SELECT
          rentals.id AS rental_id,
          rentals.renter_name,
          rentals.checkout_date,
          date(rentals.due_date) AS due_date,
          books.id AS book_id,
          books.title
        FROM rentals
        JOIN books ON rentals.book_id = books.id
        WHERE rentals.return_date IS NULL
        ORDER BY rentals.checkout_date DESC
      `)
      .all();

    res.json(rentals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /rentals/checkout
 * Creates a rental and decrements book available_copies (transaction)
 */
router.post("/checkout", (req, res) => {
  const { book_id, renter_name } = req.body;

  if (!book_id || !renter_name) {
    return res.status(400).json({
      error: "book_id and renter_name required",
    });
  }

  try {
    const checkout = req.db.transaction((bookId, renter) => {
      const book = req.db
        .prepare("SELECT id, available_copies FROM books WHERE id = ?")
        .get(bookId);

      if (!book || book.available_copies <= 0) {
        throw new Error("Book unavailable");
      }

      const result = req.db
        .prepare(`
          INSERT INTO rentals (book_id, renter_name, checkout_date, due_date)
          VALUES (?, ?, datetime('now'),datetime('now', '+14 days'))
        `)
        .run(bookId, renter);

      req.db
        .prepare("UPDATE books SET available_copies = available_copies - 1 WHERE id = ?")
        .run(bookId);

      return result.lastInsertRowid;
    });

    const rental_id = checkout(book_id, renter_name);

    res.json({
      message: "Checkout successful",
      rental_id,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * POST /rentals/return
 * Marks rental returned and increments book available_copies (transaction)
 */
router.post("/return", (req, res) => {
  const { rental_id } = req.body;

  if (!rental_id) {
    return res.status(400).json({ error: "rental_id required" });
  }

  try {
    const returnBook = req.db.transaction((rentalId) => {
      const rental = req.db
        .prepare("SELECT book_id, return_date FROM rentals WHERE id = ?")
        .get(rentalId);

      if (!rental) {
        throw new Error("Rental not found");
      }

      if (rental.return_date) {
        throw new Error("Rental already returned");
      }

      req.db
        .prepare(
          "UPDATE rentals SET return_date = datetime('now') WHERE id = ?"
        )
        .run(rentalId);

      req.db
        .prepare("UPDATE books SET available_copies = available_copies + 1 WHERE id = ?")
        .run(rental.book_id);
    });

    returnBook(rental_id);

    res.json({ message: "Return successful" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports=router;
