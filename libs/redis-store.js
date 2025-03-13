const Redis = require("ioredis");
const redis = new Redis({
     host: '127.0.0.1',
     port: 6379,
     maxRetriesPerRequest: 50, // Example value, adjust as needed
     retryStrategy(times) {
          // Implement your retry strategy logic here
          return Math.min(times * 50, 2000);
     }
});

module.exports = redis