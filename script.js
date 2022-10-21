import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  scenarios: {
    constant_request_rate: {
      executor: 'constant-arrival-rate',
      rate: 2000,
      timeunit: '1s',
      duration: '1m',
      preAllocatedVUs: 500,
      maxVUs: 500,
    }
  }
}

export default function() {
  const rnd = Math.floor(Math.random() * (1000011 - 900010 + 1) + 900010);
  // const res = http.get(`https://test-api.k6.io/`);
  const res = http.get(`http://localhost:2000/reviews/meta/${rnd}`);
  check(res, {
    'is status 200': (r) => r.status === 200,
  });
}