import app from "./app.js";
import { env } from "./config/env.js";
import { connectRedis } from "./config/redis.config.js";
import { startNotificationWorker } from "./workers/notification.worker.js";
import { startJobExpirationCron } from "./cron/jobExpiration.js";
import { setupSocket } from "./config/socket.js";
import http from 'http';

const startServer = async () => {
    try {
        await connectRedis();
        startNotificationWorker();
        startJobExpirationCron();
        
        const server = http.createServer(app);
        setupSocket(server);

        server.listen(env.PORT, () => {
             console.log(`Server is running securely bounded with Sockets on port ${env.PORT}`);
        })
    } catch (error) {
        console.log("Getting Error while setting up server");
    }
}

startServer();
