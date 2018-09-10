const express = require('express');
const { Database } = require('sqlite3').verbose();
const createError = require('http-errors');
const logger = require('morgan');
const gamesRouter = require('./routes/games');

const db = new Database(process.env.DB_FILE);
require('./utils/promisify-sqlite')(db);
const app = express();

app.use(logger('dev'));
app.use((req, res, next) => {
  req.db = db; // inject db connection
  return next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api/games', gamesRouter);

// If none of the routes matched, create not found
app.use((req, res, next) => next(createError(404, 'not found')));

// Error handler
app.use((err, req, res, next) => {
  const message = req.app.get('env') === 'development'
    ? err.message
    : 'internal error';
  const status = typeof err.status !== 'undefined'
    ? parseInt(err.status)
    : 500;

  return res.status(status)
    .send({
      status,
      message,
    });
});

module.exports = app;
