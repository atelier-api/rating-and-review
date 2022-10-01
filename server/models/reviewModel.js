const { pool } = require('../db');

exports.getReviews = async (prodId) => {
  const test = await pool.query(`SELECT * FROM reviews WHERE product_id = 72071`);
  console.log(test);
};
