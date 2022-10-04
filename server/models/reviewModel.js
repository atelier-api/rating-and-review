const { pool } = require('../db');

exports.getReviews = async (prodId) => {
  const text = 'SELECT * FROM reviews WHERE product_id = $1';
  const values = [prodId];
  console.log('START POSTGRES QUERY');
  const result = await pool.query(text, values);

  // Shape Data in result.rows
  const shapedData = await Promise.all(result.rows.map(async (current) => {
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

  await pool.end();

  // need to do something with returning default reponses for page and count
  return {
    product: prodId,
    page: 0,
    count: 5,
    results: shapedData
    }
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
  const { product_id, rating, recommend, summary, body, name, email, photos, characteristics } = post;

  try {
  const textReviews = 'INSERT INTO reviews (product_id, rating, recommend, summary, body, reviewer_name, reviewer_email) VALUES ($1, $2, $3, $4, $5, $6, $7)';
  const reviewsValues = [product_id, rating, recommend, summary, body, name, email];
  await pool.query(textReviews, reviewsValues);

  // query recent review to get review id

  // need to map it iterate through photos for multiple pictures
  const textPhotos = 'INSERT INTO photos (url, product_id) VALUES ($1, $2)';
  const photosValues = []

    await pool.end();
  } catch (error) {
    console.error(error);
    return 404;
  }
};

exports.markHelpful = async () => {

};

exports.reportReview = async () => {

};