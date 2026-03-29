import amqp from 'amqplib';
import { env } from './env.js';
import { logger } from './logger.js';

let channel = null;

export const connectRabbitMQ = async () => {
    try {
        const connection = await amqp.connect(env.RABBITMQ_URL);
        channel = await connection.createChannel();
        logger.info(`Connected to RabbitMQ at ${env.RABBITMQ_URL}`);
        return channel;
    } catch (error) {
        logger.error(`RabbitMQ Connection Error: ${error.message}`);
        return null;
    }
};

export const publishMessage = async (queue, data) => {
    try {
        if (!channel) {
            await connectRabbitMQ();
        }
        await channel.assertQueue(queue, { durable: true });
        channel.sendToQueue(queue, Buffer.from(JSON.stringify(data)), { persistent: true });
        logger.info(`Message published to queue ${queue}`);
    } catch (error) {
        logger.error(`Failed to publish message: ${error.message}`);
    }
};

export const getRabbitChannel = () => channel;
