import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth.js';
import dreamRoutes from './routes/dreams.js';
import analysisRoutes from './routes/analysis.js';
import profileRoutes from './routes/profile.js';
import insightsRoutes from './routes/insights.js';
import cardsRoutes from './routes/cards.js';
import payjsRoutes from './routes/payjs.js';
import { errorHandler } from './middleware/errorHandler.js';

export const prisma = new PrismaClient();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/dreams', dreamRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/insights', insightsRoutes);
app.use('/api/cards', cardsRoutes);
app.use('/api', payjsRoutes); // /api/plans, /api/payjs/*

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🌙 Dream Decoder backend running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
