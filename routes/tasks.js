const express = require('express');
const router = express.Router();
const db = require('sqlite3').verbose();
const conn = new db.Database('./db/database.sqlite');

conn.run(`CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  type TEXT,
  task TEXT,
  completed INTEGER DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id)
)`);

router.post('/complete', (req, res) => {
  const { user_id, type, task_id } = req.body;
  conn.run(`INSERT INTO tasks (user_id, type, task_id, completed) VALUES (?, ?, ?, 1)`,
    [user_id, type, task_id],
    (err) => {
      if (err) {
  console.error('Insert error:', err.message);
  return res.status(400).json({ error: 'Failed to record task: ' + err.message });
      }
      conn.run(`UPDATE users SET balance = balance + 0.5 WHERE id=?`, [user_id]);
      res.json({ message: 'Task recorded, balance updated' });
    });
});

module.exports = router;
