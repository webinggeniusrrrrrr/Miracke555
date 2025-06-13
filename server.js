require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const usersRoutes = require('./routes/users');
const tasksRoutes = require('./routes/tasks');
const paymentsRoutes = require('./routes/payments');

app.use(bodyParser.json());
app.use(express.static('public'));

app.use('/api/users', usersRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/payments', paymentsRoutes);

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
