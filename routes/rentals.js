const express = require('express');
const router = express.Router();

// POST /rentals/checkout
router.post('/checkout', (req, res) => {
  const { book_id, renter_name } = req.body;

  if (!book_id || !renter_name) {
    return res.status(400).json({ error: 'book_id and renter_name required' });
  }

  const db = req.db;

  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    const insertRental = `
      INSERT INTO rentals (book_id, renter_name, checkout_date, due_date)
      VALUES (?, ?, date('now'), date('now', '+14 days'))
    `;

    db.run(insertRental, [book_id, renter_name], function (err) {
      if (err) {
        db.run('ROLLBACK');
        return res.status(500).json({ error: err.message });
      }

      const updateBook = `
        UPDATE books
        SET available_copies = available_copies - 1
        WHERE id = ? AND available_copies > 0
      `;

      db.run(updateBook, [book_id], function (err) {
        if (err || this.changes === 0) {
          db.run('ROLLBACK');
          return res.status(400).json({ error: 'Book not available' });
        }

        db.run('COMMIT');
        res.json({ message: 'Book checked out successfully' });
      });
    });
  });
});

module.exports = router;
