import express from 'express';


const app = express();


//default route
app.get('/', (req, res) => {
    res.status(200).json({success:true, message: "Welcome to Talentix Backend" });
});


export default app;