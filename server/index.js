require('dotenv').config();
const app = require("./app");
const port = process.env.PORT || 3000;

try {
  app.listen(port, () => {
  console.log(`API running at http://localhost:${port}`);
  });
} catch (err) {
  console.error(err);
  process.exit();
}