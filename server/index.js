const express = require('express');
const app = express();
const port = 3000;
const reviewRoute = require('./Routing/reviewRoute');

app.use('/reviews', reviewRoute);


app.listen(port, () => {
  console.log(`API server listening on port ${port}`)
});