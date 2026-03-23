import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import {
  listShiftTypes,
  getShiftType,
  createShiftType,
  updateShiftType,
  deleteShiftType,
} from '../controllers/shiftType.controller';

const router = Router();

router.use(authenticate);

router.get('/shift-types', authorize('admin', 'manager'), listShiftTypes);
router.get('/shift-types/:id', authorize('admin', 'manager'), getShiftType);
router.post('/shift-types', authorize('admin'), createShiftType);
router.put('/shift-types/:id', authorize('admin'), updateShiftType);
router.delete('/shift-types/:id', authorize('admin'), deleteShiftType);

export default router;
