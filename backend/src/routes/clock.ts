import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import {
  clockIn,
  clockOut,
  listRecords,
  getRecord,
  editRecord,
} from '../controllers/clock.controller';

const router = Router();

router.use(authenticate);

// Clock in/out — admin + manager
router.post('/clock/in', authorize('admin', 'manager'), clockIn);
router.post('/clock/out', authorize('admin', 'manager'), clockOut);

// List and get records — admin + manager
router.get('/clock/records', authorize('admin', 'manager'), listRecords);
router.get('/clock/records/:id', authorize('admin', 'manager'), getRecord);

// Manual edit — admin only
router.put('/clock/records/:id', authorize('admin'), editRecord);

export default router;
