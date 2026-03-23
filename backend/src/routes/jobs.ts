import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import {
  listJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
} from '../controllers/job.controller';

const router = Router();

router.use(authenticate);

router.get('/jobs', authorize('admin', 'manager'), listJobs);
router.get('/jobs/:id', authorize('admin', 'manager'), getJob);
router.post('/jobs', authorize('admin'), createJob);
router.put('/jobs/:id', authorize('admin'), updateJob);
router.delete('/jobs/:id', authorize('admin'), deleteJob);

export default router;
