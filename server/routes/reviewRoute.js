const express = require('express');
const router = express.Router();

// List Reviews
router.get('/', (req, res) => {
  res.status(200);
  res.send('Reviews Index Hit!');
  //parameters: page, count, sort, product_id
});

// Get Review Metadata
router.get('/meta', (req, res) => {
  res.status(200);
  res.send('Metadata Hit');
  // parameters: product_id
})

// Add a Review
router.post('/', (req, res) => {
  res.status(201);
  res.send('Reviews index post request hit');
  // parameters: product_id, rating, summary, body, recommend, name, email, photos, characteristics
});

// Mark Review as Helpful
router.put('/:review_id/helpful', (req, res) => {
  res.status(200);
  res.send('Helpful review put request hit');
  //parameter: review_id
});

// Report Review
router.put('/:review_id/report', (req, res) => {
  res.status(200);
  res.send('Hit report review');
});



module.exports = router;
