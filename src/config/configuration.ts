import { IAppConfig } from './config.interface';

export default () =>
  ({
    port: parseInt(process.env.PORT, 10) || 3000,
    jwtSecret: process.env.JWT_SECRET,
    publicToken: process.env.PUBLIC_TOKEN,
    database: {
      uri: process.env.MONGODB_URI,
    },
    cache: {
      store: process.env.CACHE_STORE || 'memory',
      ttl: parseInt(process.env.CACHE_TTL, 10) || 3600,
      redis: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT, 10) || 6379,
        password: process.env.REDIS_PASSWORD,
      },
    },
    email: {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10) || 587,
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
      secure: process.env.SMTP_SECURE === 'true',
    },
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  }) as IAppConfig;
