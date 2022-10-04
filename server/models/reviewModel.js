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

  return {
    product: prodId,
    page: 0,
    count: 5,
    results: shapedData
    }
};