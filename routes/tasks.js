const express = require('express');
const router = express.Router();
const db = require('sqlite3').verbose();
const conn = new db.Database('./db/database.sqlite');

router.post('/complete', (req, res) => {
  const { user_id, type, task_id } = req.body;
  conn.run(`INSERT INTO tasks (user_id, type, task_id, completed) VALUES (?, ?, ?, 1)`,
    [user_id, type, task_id],
    (err) => {
      if (err) return res.status(400).json({ error: 'Failed to record task' });
      conn.run(`UPDATE users SET balance = balance + 0.5 WHERE id=?`, [user_id]);
      res.json({ message: 'Task recorded, balance updated' });
    });
});

module.exports = router;
