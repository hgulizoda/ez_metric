import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import {
  listShifts,
  getShift,
  createShift,
  updateShift,
  deleteShift,
} from '../controllers/shift.controller';

const router = Router();

router.use(authenticate);

router.get('/shifts', authorize('admin', 'manager'), listShifts);
router.get('/shifts/:id', authorize('admin', 'manager'), getShift);

router.post('/shifts', authorize('admin'), createShift);
router.put('/shifts/:id', authorize('admin'), updateShift);
router.delete('/shifts/:id', authorize('admin'), deleteShift);

export default router;
