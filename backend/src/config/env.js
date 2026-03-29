import 'dotenv/config';

const envVar = process.env;

export const env = {
    PORT: envVar.PORT,
    DATABASE_URL: envVar.DATABASE_URL,
    JWT_SECRET: envVar.JWT_SECRET || 'fallback_secret',
    OPENROUTER_API_KEY: envVar.OPENROUTER_API_KEY,
    RABBITMQ_URL: envVar.RABBITMQ_URL || 'amqp://localhost',
    REDIS_URL: envVar.REDIS_URL || 'redis://localhost:6379'
};