import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";
import { env } from "./env.js";
import { logger } from "./logger.js";
import prisma from "./prisma.js";

export const setupSocket = (server) => {
    const pubClient = createClient({ url: env.REDIS_URL });
    const subClient = pubClient.duplicate();

    Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
        logger.info("Redis Pub/Sub Adapter Seamlessly Mounted to Websockets");
    }).catch(err => {
        logger.error(`Redis Pub/Sub Adapter Failure: ${err}`);
    });

    const io = new Server(server, {
        adapter: createAdapter(pubClient, subClient),
        cors: {
            origin: "*", 
            methods: ["GET", "POST"]
        }
    });

    io.on("connection", (socket) => {
        logger.info(`Socket Connected: ${socket.id}`);

        socket.on("register", (userId) => {
            socket.join(userId); // Explicitly maps the socket to a global Redis Room identifying their User ID!
            logger.info(`User ${userId} securely linked to Global Redis Room`);
        });

        socket.on("send_message", async (data) => {
            try {
                const { roomId, senderId, receiverId, content } = data;

                const message = await prisma.message.create({
                    data: {
                        chatId: roomId,
                        senderId,
                        content,
                        isRead: false
                    }
                });

                // Blast Native Socket back targeting the Explicit Redis User Room
                // The Pub/Sub Adapter seamlessly broadcasts this to other Node servers if the Receiver is there!
                io.to(receiverId).emit("receive_message", message);
                
                // Fire optimism receipt
                socket.emit("message_sent", message);

            } catch (error) {
                logger.error(`Socket Event Failure [send_message]: ${error.message}`);
                socket.emit("error", "Message failed to send.");
            }
        });

        socket.on("disconnect", () => {
            logger.info(`Socket disconnected formally`);
        });
    });

    return io;
};
