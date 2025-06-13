const express = require('express');
const router = express.Router();
const db = require('sqlite3').verbose();
const path = require('path');
const conn = new db.Database(path.join(__dirname, '../db/database.sqlite'));

// Ensure users table exists
conn.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  password TEXT,
  referral_code TEXT,
  referred_by TEXT,
  task_id TEXT,
  balance REAL DEFAULT 0
)`);

// ✅ Insert a test user if not exists
conn.get(`SELECT * FROM users WHERE username = ?`, ['testuser'], (err, row) => {
  if (err) {
    console.error('Error checking for test user:', err.message);
    return;
  }
  if (!row) {
    const referral_code = 'REF' + Math.floor(Math.random() * 100000);
    conn.run(`INSERT INTO users (username, password, referral_code, referred_by) VALUES (?, ?, ?, ?)`,
      ['testuser', '1234', referral_code, null],
      function(err) {
        if (err) {
          console.error('Error inserting test user:', err.message);
        } else {
          console.log(`✅ Test user created. Username: testuser, Password: 1234, Referral Code: ${referral_code}`);
        }
      });
  } else {
    console.log(`✅ Test user already exists. Username: testuser, Password: 1234`);
  }
});

// Registration route
router.post('/register', (req, res) => {
  const { username, password, referred_by } = req.body;
  const referral_code = 'REF' + Math.floor(Math.random() * 100000);

  conn.run(`INSERT INTO users (username, password, referral_code, referred_by) VALUES (?, ?, ?, ?)`,
    [username, password, referral_code, referred_by || null],
    function(err) {
      if (err) {
        console.error(err.message);
        return res.status(400).json({ error: 'Username taken or DB error' });
      }
      res.json({ id: this.lastID, referral_code });
    });
});

// Login route
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  conn.get(`SELECT * FROM users WHERE username = ? AND password = ?`,
    [username, password],
    (err, row) => {
      if (row) {
        res.json(row);
      } else {
        res.status(401).json({ error: 'Invalid credentials' });
      }
    });
});

module.exports = router;
