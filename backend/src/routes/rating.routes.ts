import { Router } from 'express';
import { submitRating, getCollectorLocation } from '../controllers/rating.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);
router.post('/', submitRating);
router.get('/collector/:collectorId/location', getCollectorLocation);

export default router;
