import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import sessionRoutes from './routes/session.js';
import appsRoutes from './routes/apps.js';
import analyticsRoutes from './routes/analytics.js';

dotenv.config();
const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

// connect DB
connectDB();

// routes
app.use('/api/auth', sessionRoutes);
app.use('/api/apps', appsRoutes);
app.use('/api/analytics', analyticsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Vynce backend running on port ${PORT}`));
