import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import {
  listWorkers,
  getWorker,
  createWorker,
  updateWorker,
  deleteWorker,
} from '../controllers/worker.controller';

const router = Router();

// All worker routes require authentication
router.use(authenticate);

// admin + manager can view
router.get('/workers', authorize('admin', 'manager'), listWorkers);
router.get('/workers/:id', authorize('admin', 'manager'), getWorker);

// admin only can mutate
router.post('/workers', authorize('admin'), createWorker);
router.put('/workers/:id', authorize('admin'), updateWorker);
router.delete('/workers/:id', authorize('admin'), deleteWorker);

export default router;
