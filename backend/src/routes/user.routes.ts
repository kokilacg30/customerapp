import { Router } from 'express';
import { getMe, updateMe } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);
router.get('/me', getMe);
router.put('/me', updateMe);

export default router;
