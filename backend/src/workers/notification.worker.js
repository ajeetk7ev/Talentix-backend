import prisma from '../config/prisma.js';
import { connectRabbitMQ, getRabbitChannel } from '../config/rabbitmq.config.js';
import { logger } from '../config/logger.js';

export const startNotificationWorker = async () => {
    let channel = getRabbitChannel();
    if (!channel) {
        channel = await connectRabbitMQ();
    }
    
    if (!channel) return;

    // 1. Consume Job Creation Alerts Targetting Matching Skills
    const jobAlertsQueue = 'job_alerts';
    await channel.assertQueue(jobAlertsQueue, { durable: true });
    
    logger.info("Notification Worker Started. Listening for new jobs and application updates...");

    channel.consume(jobAlertsQueue, async (msg) => {
        if (msg !== null) {
            try {
                const data = JSON.parse(msg.content.toString());
                const { jobId, title, company, skills } = data;
                logger.info(`Processing notifications for newly created Job: ${jobId}`);

                if (skills && skills.length > 0) {
                     const matchingProfiles = await prisma.profile.findMany({
                         where: {
                             skills: {
                                 hasSome: skills
                             }
                         },
                         select: { userId: true }
                     });

                     if (matchingProfiles.length > 0) {
                         const notifications = matchingProfiles.map(profile => ({
                             userId: profile.userId,
                             title: "New Job Match!",
                             message: `${company} just posted a new job: ${title}. It matches your skills!`,
                             isRead: false
                         }));

                         await prisma.notification.createMany({
                             data: notifications
                         });

                         logger.info(`Successfully generated ${notifications.length} in-app job alerts for Job ID: ${jobId}`);
                     } else {
                         logger.info(`No matching profiles found for Job ID: ${jobId}`);
                     }
                }

                channel.ack(msg);
            } catch (error) {
                logger.error(`Worker Error generating job alerts: ${error.message}`);
                channel.ack(msg); 
            }
        }
    });

    // 2. Consume Application Status Updates
    const applicationQueue = 'application_alerts';
    await channel.assertQueue(applicationQueue, { durable: true });

    channel.consume(applicationQueue, async (msg) => {
        if (msg !== null) {
            try {
                const data = JSON.parse(msg.content.toString());
                const { userId, title, message } = data;
                logger.info(`Processing ATS application status notification for User ID: ${userId}`);

                await prisma.notification.create({
                    data: {
                        userId,
                        title,
                        message,
                        isRead: false
                    }
                });

                logger.info(`Successfully generated application status notification for User ID: ${userId}`);
                channel.ack(msg);
            } catch (error) {
                logger.error(`Worker Error generating application status notification: ${error.message}`);
                channel.ack(msg); 
            }
        }
    });
};
