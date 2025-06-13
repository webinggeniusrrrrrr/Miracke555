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
      if (err) {
        console.error("DB Insert Error:", err.message);
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: 'Username already taken' });
        }
        return res.status(500).json({ error: 'Database error' });
      }

      res.json({ id: this.lastID, referral_code });
    }
  );
});

module.exports = router;
