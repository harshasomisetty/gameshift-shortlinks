import Redis from 'ioredis';

const redisClient = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379,
  password: process.env.REDIS_PASSWORD,
  tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
});

redisClient.on('error', (error: Error) => {
  console.error('Redis connection error:', error);
  console.error('Redis connection details:', {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  });
});

redisClient.on('connect', () => {
  console.log('Successfully connected to Redis');
});

export default redisClient;
