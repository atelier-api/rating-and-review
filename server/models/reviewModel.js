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

    // Shape return data
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



exports.getMetaData = async (prod_id) => {
  try {
    // ratings
    const textRating = 'SELECT rating FROM reviews WHERE review_id = $1';
    const valueRatings = [prod_id];
    const getRatings = await pool.query(textRating, valueRatings);
    console.log('GET RATINGS', getRatings);
    // recommend

    // characteristics

  } catch (error) {
    console.error(error);
    return 500;
  }
  await pool.end();
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
  const client = await pool.connect();
  try {
    // Begin transaction
    await client.query('BEGIN');

    const { product_id, rating, recommend, summary, body, name, email, photos, characteristics } = post;

    // Insert Review
    const textReviews = 'INSERT INTO reviews (product_id, rating, recommend, summary, body, reviewer_name, reviewer_email) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING review_id';
    const reviewsValues = [product_id, rating, recommend, summary, body, name, email];
    // will return review_id
    const insertReview = await pool.query(textReviews, reviewsValues);
    const returnedReview_id = insertReview.rows[0].review_id;

    // Insert Photos
    const photoArr = photos;
    const textPhotos = 'INSERT INTO photos (url, review_id) VALUES ($1, $2) RETURNING id';
    await Promise.all(photoArr.map(async (current, index) => {
      const photosValues = [current,returnedReview_id];
      return pool.query(textPhotos, photosValues);
    }));

    // Insert Characteristics
    const charReviewArr = Object.keys(characteristics);
    const textCharReview = 'INSERT INTO characteristic_reviews (characteristic_id, review_id, value) VALUES ($1, $2, $3)'
    await Promise.all(charReviewArr.map(async (currCharId) => {
      const charReviewValues = [Number(currCharId), returnedReview_id, characteristics[currCharId]];
      await pool.query(textCharReview, charReviewValues);
    }));

    // End transaction
    await client.query('COMMIT');
    return 201;
  } catch (error) {
    console.error(error);
    return 422;
  }
  await client.release();
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