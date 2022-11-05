const express = require('express');
const reviewRoute = require('./routes/reviewRoute');

const app = express();

app.use(express.json());

app.use('/reviews', reviewRoute);

app.get('/loaderio-eda1c42c66a346ef4c9d417ddd5cc475.txt', (req, res) => {
  res.sendFile(`${__dirname}/loaderio-eda1c42c66a346ef4c9d417ddd5cc475.txt`);
});

module.exports = app;