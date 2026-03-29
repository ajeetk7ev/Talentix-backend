import express from 'express';
import authRoute from './routes/auth.route.js';
import { errorMiddleware } from './middlewares/error.middleware.js';

const app = express();

app.use(express.json());


//default route
app.get('/', (req, res) => {
    res.status(200).json({success:true, message: "Welcome to Talentix Backend" });
});

app.use("/api/v1/auth", authRoute);

app.use(errorMiddleware)


export default app;