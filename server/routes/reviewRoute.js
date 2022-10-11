const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

// List Reviews
router.get('/meta/:id/', async (req, res) => {
  //parameters: page, count, sort, product_id
  reviewController.getReviews(req, res);
});

// Get Review Metadata
router.get('/:id/', (req, res) => {
  reviewController.getMetaData(req, res);
})

// Add a Review
router.post('/', async (req, res) => {
  reviewController.postReview(req, res);
});

// Mark Review as Helpful
router.put('/:review_id/helpful/', (req, res) => {
  reviewController.markHelpful(req, res);
});

// Report Review
router.put('/:review_id/report/', (req, res) => {
  reviewController.reportReview(req, res);
});



module.exports = router;
