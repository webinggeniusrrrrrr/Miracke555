const express = require('express');
const router = express.Router();
const db = require('sqlite3').verbose();
const conn = new db.Database('./db/database.sqlite');

router.post('/register', (req, res) => {
  const { username, password, referred_by } = req.body;
  const referral_code = 'REF' + Math.floor(Math.random() * 100000);
  conn.run(`INSERT INTO users (username, password, referral_code, referred_by) VALUES (?, ?, ?, ?)`,
    [username, password, referral_code, referred_by || null],
    function(err) {
      if (err) return res.status(400).json({ error: 'Username taken' });
      res.json({ id: this.lastID, referral_code });
    });
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  conn.get(`SELECT * FROM users WHERE username=? AND password=?`,
    [username, password],
    (err, row) => {
      if (row) res.json(row);
      else res.status(401).json({ error: 'Invalid credentials' });
    });
});

module.exports = router;
