// rateLimiter.js (In middleware folder)
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5000, // Limit each IP to 5 requests per windowMs
  message: "Too many login attempts. Please try again later.",
  headers: true,
});

module.exports = loginLimiter;
