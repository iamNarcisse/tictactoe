import * as dotenv from 'dotenv';

import Redis from 'ioredis';

dotenv.config();

export const initRedis = () => {
  const redis = new Redis(process.env.REDIS_URL || '');
  return redis;
};

export const redis = initRedis();
