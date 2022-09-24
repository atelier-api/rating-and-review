const request = require('supertest');
const app = require('../server/app');

describe("List Reviews", () => {
  test("should GET all the list reviews", async () => {
    await request(app)
      .get("/reviews")
      .expect(200);
  });

  test("should get review metadata", async () => {
    await request(app)
      .get("/reviews/meta")
      .expect(200);
  });

  test("should post a review", async () => {
    await request(app)
      .post("/reviews")
      .expect(201);
  });

  test("should mark review as helpful", async () => {
    await request(app)
      .put("/reviews/:review_id/helpful")
      .expect(200);
  });

  test("should report review", async () => {
    await request(app)
      .put("/reviews/:review_id/report")
      .expect(200);
  });
});