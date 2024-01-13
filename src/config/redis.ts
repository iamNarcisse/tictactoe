import * as dotenv from 'dotenv';

import Redis from 'ioredis';

dotenv.config();

// export const redis = new Redis({
//   url: process.env.UPSTASH_REDIS_REST_URL,
//   token: process.env.UPSTASH_REDIS_REST_TOKEN,
// });

export const initRedis = () => {
  const redis = new Redis(process.env.REDIS_URL || '');
  return redis;
};
