const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const booksRouter = require('./routes/books');
const rentalsRouter= require('./routes/rentals');

const app = express();
const PORT = 3000;

// middleware
app.use(express.json());
app.use ((req,res,next)=>{
    req.db =db;
    next();
});

// database connection
const db = new sqlite3.Database('./library.db', (err) => {
  if (err) {
    console.error('Failed to connect to database:', err.message);
  } else {
    console.log('Connected to SQLite database');
  }
});

// test route
app.get('/', (req, res) => {
  res.send('Library API is running');
});

app.use('/books', booksRouter);
app.use('/rentals', rentalsRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});



