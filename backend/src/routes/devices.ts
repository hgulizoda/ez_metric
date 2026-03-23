import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import {
  listDevices,
  getDevice,
  createDevice,
  updateDevice,
  deleteDevice,
} from '../controllers/device.controller';

const router = Router();

router.use(authenticate);

router.get('/devices', authorize('admin', 'manager'), listDevices);
router.get('/devices/:id', authorize('admin', 'manager'), getDevice);
router.post('/devices', authorize('admin'), createDevice);
router.put('/devices/:id', authorize('admin'), updateDevice);
router.delete('/devices/:id', authorize('admin'), deleteDevice);

export default router;
