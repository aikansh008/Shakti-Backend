// tests/users.test.js
const request = require('supertest');
const app = require('./app'); // Adjust path as needed

describe('GET /community', () => {
  it('should return all users', async () => {
    const res = await request(app).get('/api/users');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('users');
  });
});
