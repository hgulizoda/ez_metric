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
import departmentsRouter from './routes/departments';
import jobsRouter from './routes/jobs';
import shiftTypesRouter from './routes/shiftTypes';
import devicesRouter from './routes/devices';

dotenv.config();

const app = express();

const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
app.use(
  cors({
    origin: corsOrigin === '*' ? true : corsOrigin,
    credentials: true,
  }),
);

app.use(express.json());

const allRouters = [
  healthRouter, authRouter, workersRouter, shiftsRouter,
  clockRouter, gracePeriodRulesRouter, salaryRouter, efficiencyRouter,
  reportsRouter, dashboardRouter, managersRouter, departmentsRouter,
  jobsRouter, shiftTypesRouter, devicesRouter,
];
for (const router of allRouters) {
  app.use('/api', router);
  app.use('/', router);  // Vercel serverless strips /api prefix
}

app.use(errorHandler);

export default app;
