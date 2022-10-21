const { pool } = require('../db');
const { performance } = require('node:perf_hooks');

// need to format date
exports.getReviews = async (req) => {
  const startTime = performance.now();
  const page = req.query.page || 1;
  const count = req.query.count || 5;
  const sort = req.query.sort || 'relevant';
  const id = req.params.id;
  try {
    const text = 'SELECT * FROM reviews WHERE product_id = $1';
    const values = [id];
    const result = await pool.query(text, values);

    // Remove reported reviews
    const filteredResults = result.rows.filter((current) => {
      return (!current.reported)
    })

    // Shape return data
    let shapedData = await Promise.all(filteredResults.map(async (current) => {
      // query to add photo data
      const text = 'SELECT id, url FROM photos WHERE review_id = $1';
      const values = [current.review_id];
      current.date = new Date(Number(current.date));
      const photoQuery = await pool.query(text, values);
      delete current.product_id;
      delete current.reported;
      delete current.reviewer_email;
      delete current.product_id;
      current.photos = photoQuery.rows;
      return current;
    }));

    // Sort
    if (sort === 'recent') {
      shapedData.sort((a, b) => {
        return b.date.getTime() - a.date.getTime();
      });
    }
    if (sort === 'helpful') {
      shapedData.sort((a, b) => {
        return b.helpfulness - a.helpfulness;
      });
    } else {
      // sort helpfulness at top then by date
      shapedData.sort((a, b) => {
        return b.date.getTime() - a.date.getTime();
      });
      shapedData.sort((a, b) => {
        return b.helpfulness - a.helpfulness;
      });
    }

    // Page and Count
    let sizedData = shapedData.filter((current, index) => {
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
    const text = 'SELECT rating, recommend FROM reviews WHERE product_id = $1';
    const values = [prod_id];
    const getRatingRecommended = await pool.query(text, values);
    const ratingRecommendedValues = getRatingRecommended.rows;

    // ratings and recommended
    let ratingObj = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
    let recommendedObj = {true: 0, false: 0};
    ratingRecommendedValues.forEach(current => {
      ratingObj[current.rating]++;
      recommendedObj[current.recommend]++;
    });
    for (var key in ratingObj) {
      ratingObj[key] = ratingObj[key].toString();
    }
    for (var key in recommendedObj) {
      recommendedObj[key] = recommendedObj[key].toString();
    }

    // characteristics
    const textChar = 'SELECT characteristic_id, name, value FROM characteristics c INNER JOIN characteristic_reviews r ON c.id = r.characteristic_id WHERE product_id = $1'
    const valuesChar = [prod_id];
    const getCharacteristics = await pool.query(textChar, valuesChar);
    const characteristicValues = getCharacteristics.rows;
    let charObj = {};
    // shape characteristics
    const transformChar = characteristicValues.forEach(current => {
      if (!charObj[current.name]) {
        charObj[current.name] = {
          id: current.characteristic_id,
          value: [current.value]
        }
      } else {
        charObj[current.name].value.push(current.value);
      }
    });
    // calculate characteristic value average
    for (var key in charObj) {
      let arrLength = charObj[key].value.length;
      let total = charObj[key].value.reduce((acc, current) => {
        return acc + current;
      }, 0);
      let average = total / arrLength;
      charObj[key].value = average.toString();
    }

    let finalShape = {
      product_id: prod_id,
      ratings: ratingObj,
      recommended: recommendedObj,
      characteristics: charObj,
    };
    const endTime = performance.now();
    console.log(`Call to GET METADATA took ${startTime - endTime} milliseconds.`);
    return finalShape;
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