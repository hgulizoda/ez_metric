import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import {
  clockIn,
  clockOut,
  listRecords,
  editRecord,
} from '../controllers/clock.controller';

const router = Router();

router.use(authenticate);

router.post('/clock/in', authorize('admin', 'manager'), clockIn);
router.post('/clock/out', authorize('admin', 'manager'), clockOut);
router.get('/clock/records', authorize('admin', 'manager'), listRecords);
router.put('/clock/records/:id', authorize('admin'), editRecord);

export default router;
