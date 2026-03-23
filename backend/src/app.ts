import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { errorHandler } from './middleware/errorHandler';
import authRouter from './routes/auth';
import healthRouter from './routes/health';
import workersRouter from './routes/workers';

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  }),
);

app.use(express.json());

app.use('/api', healthRouter);
app.use('/api', authRouter);
app.use('/api', workersRouter);

app.use(errorHandler);

export default app;
