const { Pool } = require('pg');
require('dotenv').config();

const connectDb = async () => {
  try {
    const pool = new Pool({
      user: process.env.PGUERS,
      host: process.env.PGHOST,
      database: process.env.PGDATABASE,
      password: process.env.PGPASSWORD,
      port: process.env.PGPORT
    })

    await pool.connect();
    console.log(`Connected to database ${process.env.PGDATABASE}`);
    await pool.end();
  } catch (error) {
    console.log(error);
  }
}

module.exports = connectDb;



// Data Table Creation and Import Statements

// CREATE TABLE reviews (id SERIAL, product_id INTEGER, rating INTEGER, date VARCHAR(25), summary TEXT, body TEXT, recommend BOOL, reported BOOL, name VARCHAR(100), email VARCHAR(255), response TEXT, helpfulness INTEGER, PRIMARY KEY(id));

// \COPY reviews(id, product_id, rating, date, summary, body, recommend, reported, name, email, response, helpfulness) FROM 'data/reviews.csv' DELIMITER ',' CSV HEADER;


// CREATE TABLE photos (id SERIAL, review_id INTEGER, url VARCHAR(255), PRIMARY KEY(id), CONSTRAINT fk_review FOREIGN KEY(review_id) REFERENCES reviews(id));

// \COPY photos(id, review_id, url) FROM 'data/reviews_photos.csv' DELIMITER ',' CSV HEADER;


// CREATE TABLE characteristics (id SERIAL, product_id INTEGER, name VARCHAR(55), PRIMARY KEY(id));

// \COPY characteristics(id, product_id, name) FROM 'data/characteristics.csv' DELIMITER ',' CSV HEADER;


// CREATE TABLE characteristic_reviews (id SERIAL, characteristic_id INTEGER, review_id INTEGER, value INTEGER, PRIMARY KEY(id), CONSTRAINT fk_characteristic_review FOREIGN KEY(review_id) REFERENCES reviews(id), CONSTRAINT fk_characteristics FOREIGN KEY(characteristic_id) REFERENCES characteristics(id));

// \COPY characteristic_reviews(id, characteristic_id, review_id, value) FROM 'data/characteristic_reviews.csv' DELIMITER ',' CSV HEADER;