import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import authRoute from './routes/auth.route.js';
import jobRoute from './routes/job.route.js';
import resumeRoute from './routes/resume.route.js';
import applicationRoute from './routes/application.route.js';
import communityRoute from './routes/community.route.js';
import notificationRoute from './routes/notification.route.js';
import profileRoute from './routes/profile.route.js';
import companyRoute from './routes/company.route.js';
import adminRoute from './routes/admin.route.js';
import chatRoute from './routes/chat.route.js';
import billingRoute from './routes/billing.route.js';
import { errorMiddleware } from './middlewares/error.middleware.js';

const app = express();


app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

//default route
app.get('/', (req, res) => {
    res.status(200).json({success:true, message: "Welcome to Talentix Backend" });
});

app.use("/api/v1/auth", authRoute);
app.use("/api/v1/jobs", jobRoute);
app.use("/api/v1/resumes", resumeRoute);
app.use("/api/v1/applications", applicationRoute);
app.use("/api/v1/community", communityRoute);
app.use("/api/v1/notifications", notificationRoute);
app.use("/api/v1/profiles", profileRoute);
app.use("/api/v1/companies", companyRoute);
app.use("/api/v1/admin", adminRoute);
app.use("/api/v1/chat", chatRoute);
app.use("/api/v1/billing", billingRoute);

app.use(errorMiddleware)

export default app;