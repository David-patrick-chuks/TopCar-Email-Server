const express = require('express');
const createError = require('http-errors');
const morgan = require('morgan');
require('dotenv').config();
const connectDB = require('./config/db'); // Import MongoDB connection

const { acknowledgmentEmailCron, weeklyFollowUpCron } = require('./crons');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev'));


// Connect to MongoDB
connectDB();
app.get('/', async (req, res, next) => {
  res.send({ message: 'Awesome it works 🐻' });
});

app.use('/api/email', require('./routes/api.route'));

// Start cron jobs
acknowledgmentEmailCron();
weeklyFollowUpCron();
app.use((req, res, next) => {
  next(createError.NotFound());
});

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.send({
    status: err.status || 500,
    message: err.message,
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 @ http://localhost:${PORT}`));
