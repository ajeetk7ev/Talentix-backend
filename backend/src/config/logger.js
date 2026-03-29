import winston from "winston";
import  env  from "./env.js";

const format =
  env.NODE_ENV === "development"
    ? winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.printf(
          ({ timestamp, level, message, stack, ...meta }) => {
            const rest = Object.keys(meta).length
              ? ` ${JSON.stringify(meta)}`
              : "";
            return `${timestamp} [${level}]: ${stack || message}${rest}`;
          },
        ),
      )
    : winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
      );

export const logger = winston.createLogger({
  level: env.NODE_ENV === "development" ? "debug" : "info",
  format,
  transports: [
    new winston.transports.Console(),

  ],
});