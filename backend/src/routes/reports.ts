import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import {
  payrollSummary,
  exportExcel,
  weeklyStatements,
  workerInspection,
  listStatements,
  getStatement,
  fakeGmail,
} from '../controllers/report.controller';

const router = Router();

router.use(authenticate);

router.get('/reports', authorize('admin', 'manager'), payrollSummary);
router.get('/reports/export', authorize('admin'), exportExcel);
router.get('/reports/weekly', authorize('admin', 'manager'), weeklyStatements);
router.get('/reports/statements', authorize('admin'), listStatements);
router.get('/reports/statements/:id', authorize('admin'), getStatement);
router.post('/reports/statements/:id/gmail', authorize('admin'), fakeGmail);
router.get('/reports/:worker_id', authorize('admin', 'manager'), workerInspection);

export default router;
