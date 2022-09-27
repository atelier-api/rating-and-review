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
    // const res = await pool.query('SELECT * FROM dukeromkey');
    // console.log(res);
    await pool.end();
  } catch (error) {
    console.log(error);
  }
}

module.exports = connectDb;
