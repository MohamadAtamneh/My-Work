import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bodyParser from 'body-parser';
import puppeteer from 'puppeteer';
import apiRoutes from './routes/api.js';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ai_resume";

// Middleware
app.use(cors({
    origin: FRONTEND_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-user-id"],
}));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false, limit: "5mb" }));

// DEV-ONLY: map x-user-id header to req.userId so routes can identify the user
app.use((req, res, next) => {
    const devUserId = req.headers["x-user-id"];
    if (devUserId && !req.userId) {
        req.userId = devUserId;
    }
    next();
});

// MongoDB connection
mongoose
    .connect(MONGO_URI)
    .then(() => console.log("✅ MongoDB connected"))
    .catch((err) => console.error("❌ MongoDB connection error:", err));

// Routes
app.use('/api', apiRoutes);

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack || err);
    res.status(err.status || 500).send(err.message || "Something broke!");
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Make puppeteer accessible (if needed elsewhere)
app.set("puppeteer", puppeteer);
