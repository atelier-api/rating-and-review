const express = require('express');
const reviewRoute = require('./routes/reviewRoute');

const app = express();

app.use(express.json());

app.use('/reviews', reviewRoute);

app.get('/loaderio-398d1e422ef47a2e3e30fe05f51d308a.txt', (req, res) => {
  res.sendFile(`${__dirname}/loaderio-398d1e422ef47a2e3e30fe05f51d308a.txt`);
});

module.exports = app;