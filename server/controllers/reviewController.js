const ReviewModel = require('../models/reviewModel');

exports.getReviews = async (req, res) => {
  const reviews = await ReviewModel.getReviews(req.params.id);
  if (reviews !== 422) {
    res.status(200).send(reviews);
  } else {
    res.status(422).send('Unprocessable Entity');
  }
};

exports.getMetaData = async (req, res) => {
  const metaData = await ReviewModel.getMetaData(req.params.id);
  if (metaData !== 500) {
    res.status(200).send(metaData);
  } else {
    res.status(500).send('An error occurred. If this error persists, contact your instruction team.');
  }
};

exports.postReview = async (req, res) => {
  const postStatus = await ReviewModel.postReview(req.body);
  if (postStatus === 201) {
    res.status(201).send('CREATED');
  } else {
    res.status(422).send('Error: review body contains invalid entries');
  }
};

exports.markHelpful = async (req, res) => {
  const markStatus = await ReviewModel.markHelpful(req.params.review_id);
  if (markStatus === 204) {
    res.status(204).send('No Content');
  } else {
    res.status(500).send('An error occurred. If this persists, contact your instruction team.');
  }
};

exports.reportReview = async (req, res) => {
  const reportStatus = await ReviewModel.reportReview(req.params.review_id);
  if (reportStatus === 204) {
    res.status(204).send('No Content');
  } else {
    res.status(404).send('Not Found');
  }
};

