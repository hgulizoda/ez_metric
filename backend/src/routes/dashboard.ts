import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import {
  getSummary,
  getWorkedHours,
  getHoursTrend,
  getClockStatus,
  getBonusProgress,
} from '../controllers/dashboard.controller';

const router = Router();

router.use(authenticate);
router.use(authorize('admin', 'manager'));

router.get('/dashboard/summary', getSummary);
router.get('/dashboard/worked-hours', getWorkedHours);
router.get('/dashboard/hours-trend', getHoursTrend);
router.get('/dashboard/clock-status', getClockStatus);
router.get('/dashboard/bonus-progress', getBonusProgress);

export default router;
