const ReviewModel = require('../models/reviewModel');

exports.getReviews = async (req, res) => {
  console.log('HIT CONTROLLER GET REVIEWS');
  const reviews = await ReviewModel.getReviews(req.params.id);
  return reviews;
};

exports.getMetaData = async (req, res) => {
  const metaData = await ReviewModel.getMetaData(req.params.id);
  return metaData;
};

exports.postReview = async (req, res) => {
  const postStatus = await ReviewModel.postReview(req.body);
  return postStatus;
};

exports.markHelpful = async (req, res) => {
  const markStatus = await ReviewModel.markHelpful();
  return markStatus;
};

exports.reportReview = async (req, res) => {
  const reportStatus = await ReviewModel.reportReview();
  return reportStatus;
};

