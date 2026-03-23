import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { listEfficiency, getWorkerEfficiency } from '../controllers/efficiency.controller';
import {
  listBonusRules,
  createBonusRule,
  updateBonusRule,
  deleteBonusRule,
  listBonuses,
  createManualBonus,
} from '../controllers/bonus.controller';

const router = Router();

router.use(authenticate);

// Efficiency
router.get('/efficiency', authorize('admin', 'manager'), listEfficiency);
router.get('/efficiency/:worker_id', authorize('admin', 'manager'), getWorkerEfficiency);

// Bonus rules (admin only)
router.get('/bonus-rules', authorize('admin'), listBonusRules);
router.post('/bonus-rules', authorize('admin'), createBonusRule);
router.put('/bonus-rules/:id', authorize('admin'), updateBonusRule);
router.delete('/bonus-rules/:id', authorize('admin'), deleteBonusRule);

// Bonuses
router.get('/bonuses', authorize('admin'), listBonuses);
router.post('/bonuses/manual', authorize('admin'), createManualBonus);

export default router;
