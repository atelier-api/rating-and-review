const { pool } = require('../db');

exports.getReviews = async (prodId) => {
  console.log('start postgres query');
  const test = await pool.query(`SELECT * FROM reviews WHERE product_id = 72071`);
  await pool.end();
  return test;
};
