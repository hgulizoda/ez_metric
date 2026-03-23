import { Router } from 'express';
import { login, me } from '../controllers/auth.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router();

router.post('/auth/login', login);
router.get('/auth/me', authenticate, me);

export default router;
