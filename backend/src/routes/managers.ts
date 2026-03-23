import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import {
  listManagers,
  createManager,
  updateManager,
  deleteManager,
} from '../controllers/manager.controller';

const router = Router();

router.use(authenticate);
router.use(authorize('admin'));

router.get('/managers', listManagers);
router.post('/managers', createManager);
router.put('/managers/:id', updateManager);
router.delete('/managers/:id', deleteManager);

export default router;
