const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();
const db = new sqlite3.Database('./db.sqlite');
const PORT = process.env.PORT || 3000;
const FLW_SECRET_KEY = process.env.FLW_SECRET_KEY;

app.use(bodyParser.json());
app.use(express.static('public'));

// DB setup
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        email TEXT,
        password TEXT,
        balance REAL DEFAULT 0,
        referrals INTEGER DEFAULT 0
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT,
        description TEXT,
        reward REAL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS user_tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        task_id INTEGER,
        completed INTEGER DEFAULT 0
    )`);
});

// Serve pages
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, 'public', 'dashboard.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));

// Register
app.post('/api/register', (req, res) => {
    const { username, email, password, referrer } = req.body;
    db.run('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, password], function(err) {
        if (err) return res.json({ success: false, error: err.message });
        
        if (referrer) {
            db.run('UPDATE users SET referrals = referrals + 1, balance = balance + 100 WHERE username = ?', [referrer]);
        }

        res.json({ success: true, userId: this.lastID });
    });
});

// Login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, row) => {
        if (row) {
            res.json({ success: true, userId: row.id });
        } else {
            res.json({ success: false, message: 'Invalid credentials' });
        }
    });
});

// Get tasks
app.get('/api/tasks', (req, res) => {
    db.all('SELECT * FROM tasks', (err, rows) => {
        res.json(rows);
    });
});

// Complete task
app.post('/api/complete_task', (req, res) => {
    const { userId, taskId } = req.body;
    db.get('SELECT * FROM user_tasks WHERE user_id = ? AND task_id = ?', [userId, taskId], (err, row) => {
        if (row) return res.json({ success: false, message: 'Already completed' });

        db.run('INSERT INTO user_tasks (user_id, task_id, completed) VALUES (?, ?, 1)', [userId, taskId]);
        db.get('SELECT reward FROM tasks WHERE id = ?', [taskId], (err, task) => {
            db.run('UPDATE users SET balance = balance + ? WHERE id = ?', [task.reward, userId]);
            res.json({ success: true });
        });
    });
});

// Create task (admin)
app.post('/api/admin/create_task', (req, res) => {
    const { type, description, reward } = req.body;
    db.run('INSERT INTO tasks (type, description, reward) VALUES (?, ?, ?)', [type, description, reward], function(err) {
        if (err) return res.json({ success: false, error: err.message });
        res.json({ success: true, taskId: this.lastID });
    });
});

// Withdraw
app.post('/api/withdraw', async (req, res) => {
    const { userId, amount, account_number, bank_code } = req.body;
    db.get('SELECT balance FROM users WHERE id = ?', [userId], async (err, row) => {
        if (row.balance < amount) return res.json({ success: false, message: 'Insufficient balance' });

        try {
            const response = await axios.post('https://api.flutterwave.com/v3/transfers', {
                account_bank: bank_code,
                account_number,
                amount,
                currency: 'NGN',
                reference: 'wd-' + Date.now(),
                narration: 'Task earnings'
            }, {
                headers: { Authorization: `Bearer ${FLW_SECRET_KEY}` }
            });

            if (response.data.status === 'success') {
                db.run('UPDATE users SET balance = balance - ? WHERE id = ?', [amount, userId]);
                res.json({ success: true });
            } else {
                res.json({ success: false, message: 'Transfer failed' });
            }
        } catch (e) {
            res.json({ success: false, error: e.message });
        }
    });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
