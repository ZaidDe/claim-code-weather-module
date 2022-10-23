/* eslint-disable linebreak-style */
const Redis = require('ioredis');

const RedisClient = new Redis({
  port: 6379,
});

module.exports = RedisClient;
