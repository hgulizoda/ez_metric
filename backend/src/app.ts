import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { errorHandler } from './middleware/errorHandler';
import authRouter from './routes/auth';
import healthRouter from './routes/health';
import workersRouter from './routes/workers';
import shiftsRouter from './routes/shifts';
import clockRouter from './routes/clock';
import gracePeriodRulesRouter from './routes/gracePeriodRules';
import salaryRouter from './routes/salary';
import efficiencyRouter from './routes/efficiency';
import reportsRouter from './routes/reports';
import dashboardRouter from './routes/dashboard';
import managersRouter from './routes/managers';

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
app.use('/api', shiftsRouter);
app.use('/api', clockRouter);
app.use('/api', gracePeriodRulesRouter);
app.use('/api', salaryRouter);
app.use('/api', efficiencyRouter);
app.use('/api', reportsRouter);
app.use('/api', dashboardRouter);
app.use('/api', managersRouter);

app.use(errorHandler);

export default app;
