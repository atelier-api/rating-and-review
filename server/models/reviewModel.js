const { pool } = require('../db');

exports.getReviews = async (prodId) => {
  try {
    const text = 'SELECT * FROM reviews WHERE product_id = $1';
    const values = [prodId];
    const result = await pool.query(text, values);

    // Remove reported reviews
    const filteredResults = result.rows.filter((current) => {
      return (!current.reported)
    })

    // Shape Data in result.rows
    const shapedData = await Promise.all(filteredResults.map(async (current) => {
      // query to add photo data
      const text = 'SELECT id, url FROM photos WHERE review_id = $1';
      const values = [current.review_id];
      const photoQuery = await pool.query(text, values);
      delete current.product_id;
      delete current.reported;
      delete current.reviewer_email;
      delete current.product_id;
      current.photos = photoQuery.rows;
      return current;
    }));
    return {
      product: prodId,
      page: 0,
      count: 5,
      results: shapedData
      }
  } catch (error) {
    console.error(error);
    return 422;
  }
  await pool.end();
};

exports.getMetaData = async () => {

};

/* Review Post Shape
{
  "product_id": 71701,
  "rating": 0,
  "recommend": true,
  "summary": "Test Title",
  "body": "Test Body Review",
  "name": "Tester Nickname",
  "email": "Tester@gmail.com",
  "photos": ["https://www.google.com/url?sa=i&url=https%3A%2F%2Fsienaconstruction.com%2Ftest-image%2F&psig=AOvVaw3TPNMh90NX08BCjWfry54V&ust=1664938829180000&source=images&cd=vfe&ved=0CAsQjRxqFwoTCMDMos3KxfoCFQAAAAAdAAAAABAE"],
  "characteristics": {
      "240595": 1,
      "240596": 2,
      "240597": 2,
      "240598": 3
  }
}
*/
exports.postReview = async (post) => {
  try {
    const { product_id, rating, recommend, summary, body, name, email, photos, characteristics } = post;
    // Begin transaction
    await pool.query('BEGIN');

    // Insert Review
    const textReviews = 'INSERT INTO reviews (product_id, rating, recommend, summary, body, reviewer_name, reviewer_email) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING review_id';
    const reviewsValues = [product_id, rating, recommend, summary, body, name, email];
    // will return review_id
    const insertReview = await pool.query(textReviews, reviewsValues);
    console.log('REVIEW ID', insertReview.rows[0].review_id);

    // Insert Photos
    const photoArr = photos;
    const textPhotos = 'INSERT INTO photos (url, review_id) VALUES ($1, $2) RETURNING id';
    const insertPhotos = await Promise.all(photoArr.map(async (current, index) => {
      const photosValues = [current, insertReview.rows[0].review_id];
      return pool.query(textPhotos, photosValues);
    }));

    // Testing for review_id being present in reviews table
    console.log('HIT TEST');
    const testReviewID = 'SELECT * FROM reviews WHERE review_id = $1';
    const testValues = [insertReview.rows[0].review_id];
    // will return review_id
    const testReview = await pool.query(testReviewID, testValues);
    console.log('TEST REVIEW', testReview.rows);

    // Insert Characteristics
    const charReviewArr = Object.keys(characteristics);
    console.log('HIT CHARACTERISTIC');
    const textCharReview = 'INSERT INTO characteristic_reviews (characteristic_id, review_id, value) VALUES ($1, $2, $3)'
    const insertCharReview = await Promise.all(charReviewArr.map(async (currCharId) => {
      const charReviewValues = [Number(currCharId), insertReview.rows[0].review_id, characteristics[currCharId]];
      console.log('CHAR REVIEW', charReviewValues);
      await pool.query(textCharReview, charReviewValues);
    }));


    // End transaction
    await pool.query('COMMIT');
    return 'Successful Post Request';
  } catch (error) {
    console.error(error);
    return 404;
  }
  await pool.end();
};

exports.markHelpful = async (review_id) => {
  try {
    const text = 'UPDATE reviews SET helpfulness = helpfulness + 1 WHERE review_id = $1'
    const values = [review_id]
    const updateHelpfulness = await pool.query(text, values);
    return 204;
  } catch (error) {
    console.error(error);
    return 500;
  }
  await pool.end();
};

exports.reportReview = async (review_id) => {
  try {
    const text = 'UPDATE reviews SET reported = true WHERE review_id = $1';
    const values = [review_id]
    const updateReported = await pool.query(text, values);
    return 204;
  } catch (error) {
    console.error(error);
    return 404;
  }
  await pool.end();
};