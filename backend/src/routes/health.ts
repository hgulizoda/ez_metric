import { Router } from 'express';
import { sendSuccess } from '../utils/apiResponse';

const router = Router();

router.get('/health', (_req, res) => {
  sendSuccess(res, { status: 'ok' });
});

export default router;
