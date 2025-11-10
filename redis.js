const Redis = require('ioredis');
let redis;
if (process.env.REDIS_URL) {
  redis = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: false,
    retryStrategy(times) {
      if (times > 3) {
        console.warn('⚠️ Redis connection failed, continuing without cache');
        return null;
      }
      return Math.min(times * 100, 2000);
    }
  });
}
else {
  
  redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      if (times > 3) {
        console.warn('⚠️ Redis connection failed, continuing without cache');
        return null;
      }
      return Math.min(times * 100, 2000);
    }
  });
}

redis.on('error', (err) => {
  console.warn('⚠️ Redis error:', err.message);
});

redis.on('connect', () => {
  console.log('✅ Redis connected successfully');
});