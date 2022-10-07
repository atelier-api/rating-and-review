const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');


// Include middleware if needed

// Will designate which controller function for each route

// List Reviews
router.get('/meta/:id', async (req, res) => {
  //parameters: page, count, sort, product_id
  reviewController.getReviews(req, res);
});

// Get Review Metadata
router.get('/:id', (req, res) => {
  // parameters: product_id
  res.status(200);
  res.send('Metadata Hit');
})

// Add a Review
router.post('/', async (req, res) => {
  // parameters: product_id, rating, summary, body, recommend, name, email, photos, characteristics
  reviewController.postReview(req, res);
});

// Mark Review as Helpful
router.put('/:review_id/helpful', (req, res) => {
  reviewController.markHelpful(req, res);
});

// Report Review
router.put('/:review_id/report', (req, res) => {
  reviewController.reportReview(req, res);
});



module.exports = router;
