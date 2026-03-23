import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import {
  listRules,
  getRuleByWorkerId,
  upsertRule,
  listCharges,
  createCharge,
  updateCharge,
  deleteCharge,
  calculateSalary,
} from '../controllers/salary.controller';

const router = Router();

router.use(authenticate);
router.use(authorize('admin'));

router.get('/salary/rules', listRules);
router.get('/salary/rules/:worker_id', getRuleByWorkerId);
router.post('/salary/rules', upsertRule);

router.get('/charges', listCharges);
router.post('/charges', createCharge);
router.put('/charges/:id', updateCharge);
router.delete('/charges/:id', deleteCharge);

router.get('/salary/calculate/:worker_id', calculateSalary);

export default router;
