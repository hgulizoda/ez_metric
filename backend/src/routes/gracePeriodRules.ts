import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import {
  listRules,
  createRule,
  updateRule,
  deleteRule,
} from '../controllers/gracePeriodRule.controller';

const router = Router();

router.use(authenticate);

router.get('/grace-period-rules', authorize('admin'), listRules);
router.post('/grace-period-rules', authorize('admin'), createRule);
router.put('/grace-period-rules/:id', authorize('admin'), updateRule);
router.delete('/grace-period-rules/:id', authorize('admin'), deleteRule);

export default router;
