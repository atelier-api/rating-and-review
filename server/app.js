const express = require('express');
const reviewRoute = require('./routes/reviewRoute');

const app = express();

app.use(express.json());

app.use('/reviews', reviewRoute);

module.exports = app;