const express = require('express');
const axios = require('axios');
const router = express.Router();
const db = require('sqlite3').verbose();
const conn = new db.Database('./db/database.sqlite');

router.post('/withdraw', async (req, res) => {
  const { user_id, amount, account_number, bank_code } = req.body;

  conn.get(`SELECT * FROM users WHERE id=?`, [user_id], async (err, user) => {
    if (!user || user.balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    try {
      const response = await axios.post(
        'https://api.flutterwave.com/v3/transfers',
        {
          account_bank: bank_code,
          account_number: account_number,
          amount: amount,
          currency: 'NGN',
          narration: 'Reward Withdrawal',
          callback_url: 'http://yourdomain.com/callback'
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`
          }
        }
      );

      if (response.data.status === 'success') {
        conn.run(`UPDATE users SET balance = balance - ? WHERE id=?`, [amount, user_id]);
        res.json({ message: 'Withdrawal successful' });
      } else {
        res.status(400).json({ error: 'Withdrawal failed' });
      }
    } catch (e) {
      res.status(500).json({ error: 'Payment service error' });
    }
  });
});

module.exports = router;
