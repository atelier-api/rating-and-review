const { pool } = require('../db');
const { performance } = require('node:perf_hooks');

exports.getReviews = async (req) => {
  const startTime = performance.now();
  const page = req.query.page || 1;
  const count = req.query.count || 5;
  const sort = req.query.sort || 'relevant';
  const id = req.params.id;

  try {
    const text = `SELECT r.review_id, rating, summary, recommend, response, body, date, reviewer_name, helpfulness, json_agg(json_build_object('id', p.id, 'url', p.url)) FILTER (WHERE p.id IS NOT null) AS photos FROM reviews r LEFT JOIN photos p ON r.review_id = p.review_id WHERE product_id = $1 AND reported = false GROUP BY r.review_id`;
    const values = [id];
    const result = await pool.query(text, values);

    // Made date readable
    const resultWithDate = result.rows.map(current => {
      current.date = new Date(Number(current.date));
      if (current.photos === null) {
        current.photos = [];
      }
      return current;
    });

    // Sort Data
    if (sort === 'recent') {
      resultWithDate.sort((a, b) => {
        return b.date.getTime() - a.date.getTime();
      });
    }
    if (sort === 'helpful') {
      resultWithDate.sort((a, b) => {
        return b.helpfulness - a.helpfulness;
      });
    } else {
      // sort helpfulness at top then by date
      resultWithDate.sort((a, b) => {
        return b.date.getTime() - a.date.getTime();
      });
      resultWithDate.sort((a, b) => {
        return b.helpfulness - a.helpfulness;
      });
    }

     // Page and Count
     let sizedData = resultWithDate.filter((current, index) => {
      const endIndex = count * page;
      const startIndex = endIndex - count;
      return index >= startIndex && index < endIndex;
    });

    const endTime = performance.now();
    console.log(`Call to GET REVIEWS took ${startTime - endTime} milliseconds.`);
    return {
      product: id,
      page: page,
      count: count,
      results: sizedData
      }
  } catch (error) {
    console.error(error);
    return 422;
  }
  await pool.end();
};



exports.getMetaData = async (prod_id) => {
  const startTime = performance.now();
  try {
    // Rating and Review Query
    // 'SELECT json_object_agg(rating, count_rating) AS ratings, json_object_agg(recommend, count_recommend) AS recommended FROM (SELECT rating, COUNT(rating) AS count_rating, recommend, COUNT(recommend) AS count_recommend FROM reviews WHERE product_id = $1 GROUP BY rating, recommend) AS foo';

    // Characteristic Query
    // `SELECT json_object_agg(name, charObj) AS characteristics FROM (SELECT name, json_build_object('id', c.id, 'value', AVG(r.value)) AS charObj FROM characteristics c INNER JOIN characteristic_reviews r ON c.id = r.characteristic_id WHERE product_id = $1 GROUP BY c.name, c.id) AS boo;`

    // Combined Query
    const text = `SELECT product_id, json_object_agg(rating, count_rating) AS ratings, json_object_agg(recommend, count_recommend) AS recommended, json_object_agg(name, charObj) AS characteristics FROM (SELECT c.product_id AS product_id, rating, COUNT(rating) AS count_rating, recommend, COUNT(recommend) AS count_recommend, name, json_build_object('id', c.id, 'value', AVG(r.value)) AS charObj FROM reviews INNER JOIN characteristic_reviews r ON reviews.review_id = r.review_id INNER JOIN characteristics c ON c.id = r.characteristic_id WHERE c.product_id = $1 GROUP BY rating, recommend, c.name, c.id) AS foo GROUP BY product_id`

    const values = [prod_id];
    const getRatingRecommended = await pool.query(text, values);
    const ratingRecommendedValues = getRatingRecommended.rows[0];

    // Add missing ratings
    if (!ratingRecommendedValues.ratings[1]) {
      ratingRecommendedValues.ratings[1] = 0;
    }
    if (!ratingRecommendedValues.ratings[2]) {
      ratingRecommendedValues.ratings[2] = 0;
    }
    if (!ratingRecommendedValues.ratings[3]) {
      ratingRecommendedValues.ratings[3] = 0;
    }
    if (!ratingRecommendedValues.ratings[4]) {
      ratingRecommendedValues.ratings[4] = 0;
    }
    if (!ratingRecommendedValues.ratings[5]) {
      ratingRecommendedValues.ratings[5] = 0;
    }
    // Add missing true or false
    if (!ratingRecommendedValues.recommended.true) {
      ratingRecommendedValues.recommended.true = 0;
    }
    if (!ratingRecommendedValues.recommended.false) {
      ratingRecommendedValues.recommended.false = 0;
    }


    const endTime = performance.now();
    console.log(`Call to GET METADATA took ${startTime - endTime} milliseconds.`);
    return ratingRecommendedValues;
  } catch (error) {
    console.error(error);
    return 500;
  }
  await pool.end();
};

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
    const insertReview = await client.query(textReviews, reviewsValues);
    const returnedReview_id = insertReview.rows[0].review_id;

    // Insert Photos
    const photoArr = photos;
    const textPhotos = 'INSERT INTO photos (url, review_id) VALUES ($1, $2) RETURNING id';
    await Promise.all(photoArr.map(async (current, index) => {
      const photosValues = [current,returnedReview_id];
      return client.query(textPhotos, photosValues);
    }));

    // Insert Characteristics
    const charReviewArr = Object.keys(characteristics);
    const textCharReview = 'INSERT INTO characteristic_reviews (characteristic_id, review_id, value) VALUES ($1, $2, $3)'
    await Promise.all(charReviewArr.map(async (currCharId) => {
      const charReviewValues = [Number(currCharId), returnedReview_id, characteristics[currCharId]];
      await client.query(textCharReview, charReviewValues);
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