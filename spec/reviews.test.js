const request = require('supertest');
const app = require('../server/app');

describe("List Reviews", () => {
  test("should GET all the list reviews", async () => {
    await request(app)
      .get("/reviews")
      .expect(200);
      // .end((err, res) => {
      //   if (err) return done(err);
      //   return done();
      // });
  });
});