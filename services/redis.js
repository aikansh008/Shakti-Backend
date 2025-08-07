// config/redis.js
const Redis = require('ioredis');
const redis = new Redis({
  host: '172.17.0.1', // since Redis and Node are on the same EC2
  port: 6379,
});

module.exports = redis;
  