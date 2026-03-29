import app from "./app.js";
import { env } from "./config/env.js";



const startServer = async () => {
    try {
        app.listen(env.PORT, () => {
            console.log(`Server is running on port ${env.PORT}`);
        })
    } catch (error) {
        console.log("Getting Error while setting up server");
    }
}

startServer();

