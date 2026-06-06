// Set dummy environment variables for tests
process.env.DATABASE_URL = 'postgresql://dummy:dummy@localhost:5432/dummy';
process.env.DIRECT_DATABASE_URL = 'postgresql://dummy:dummy@localhost:5432/dummy';
process.env.JWT_ACCESS_SECRET = 'dummy_secret_dummy_secret_dummy_secret_123';
process.env.JWT_REFRESH_SECRET = 'dummy_secret_dummy_secret_dummy_secret_123';
process.env.UPSTASH_REDIS_REST_URL = 'https://dummy.upstash.io';
process.env.UPSTASH_REDIS_REST_TOKEN = 'dummy_token';
process.env.GEMINI_API_KEY = 'dummy_key';
process.env.RATE_LIMIT_WINDOW_MS = '900000';
process.env.RATE_LIMIT_MAX_REQUESTS = '100';
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:10000/api/v1';
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
