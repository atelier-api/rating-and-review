const ReviewModel = require('../models/reviewModel');

exports.getReviews = async (req, res) => {
  console.log('HIT CONTROLLER GET REVIEWS');
  const reviews = await ReviewModel.getReviews(req.params.id);
  return reviews;
};

exports.getMetaData = (req, res) => {

};

exports.postReview = (req, res) => {

};

exports.markHelpful = (req, res) => {

};

exports.reportReview = (req, res) => {

};

