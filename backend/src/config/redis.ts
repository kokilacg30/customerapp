import RedisMock from 'ioredis-mock';

// Using ioredis-mock to bypass the need for a real Redis server during local testing
export const redis = new RedisMock();

redis.on('connect', () => {
  console.log('✅ Redis (Mock) connected');
});

redis.on('error', (err) => {
  console.error('❌ Redis (Mock) error:', err.message);
});

export default redis;
