import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import {
  listDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from '../controllers/department.controller';

const router = Router();

router.use(authenticate);

router.get('/departments', authorize('admin', 'manager'), listDepartments);
router.get('/departments/:id', authorize('admin', 'manager'), getDepartment);
router.post('/departments', authorize('admin'), createDepartment);
router.put('/departments/:id', authorize('admin'), updateDepartment);
router.delete('/departments/:id', authorize('admin'), deleteDepartment);

export default router;
