const express = require('express');
const router = express.Router();

// GET /books
router.get('/', (req, res) => {
  const sql = 'SELECT * FROM books';

  req.db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

module.exports = router;
