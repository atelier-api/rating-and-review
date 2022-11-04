const request = require('supertest');
const app = require('../server/app');

const reviewPost = {
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
};

describe("List Reviews", () => {
  test("should GET all the list reviews", async () => {
    await request(app)
      .get("/reviews/meta/2")
      .expect(200);
  }, 15000);

  test("should get review metadata", async () => {
    await request(app)
      .get("/reviews/2")
      .expect(200);
  }, 15000);

  test("should post a review", async () => {
    await request(app)
      .post("/reviews")
      .send(reviewPost)
      .expect(201);
  });

  test("should mark review as helpful", async () => {
    await request(app)
      .put("/reviews/2/helpful")
      .expect(204);
  });

  test("should report review", async () => {
    await request(app)
      .put("/reviews/1/report")
      .expect(204);
  });
});