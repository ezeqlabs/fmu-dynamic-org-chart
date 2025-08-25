import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  throw new Error('A URL do Redis (REDIS_URL) não está definida no ambiente.');
}

const redis = new Redis(redisUrl);

export default redis;
