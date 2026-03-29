import cron from 'node-cron';
import prisma from '../config/prisma.js';
import { logger } from '../config/logger.js';

export const startJobExpirationCron = () => {
    // Run exactly at midnight server time every single day
    cron.schedule('0 0 * * *', async () => {
        logger.info('Executing Cron Job: Scanning for Expired Postings...');
        try {
            // Calculate precisely 30 Days ago
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const result = await prisma.job.updateMany({
                where: {
                    isExpired: false,
                    createdAt: {
                        lt: thirtyDaysAgo
                    }
                },
                data: {
                    isExpired: true,
                    expiresAt: new Date()
                }
            });

            if (result.count > 0) {
                logger.info(`Cron Operation Complete: Successfully expired ${result.count} stale jobs.`);
            } else {
                logger.info('Cron Operation Complete: No stale jobs identified.');
            }
        } catch (error) {
            logger.error(`Cron Job Failure: ${error.message}`);
        }
    });

    logger.info('Enterprise Cron Daemon Mounted: Job Expiration Engine Online.');
};
