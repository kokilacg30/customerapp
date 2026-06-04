import { Router } from 'express';
import {
  createBooking,
  getBookings,
  getBookingById,
  cancelBooking,
  getBookingStatus,
} from '../controllers/booking.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);
router.post('/', createBooking);
router.get('/', getBookings);
router.get('/:id', getBookingById);
router.get('/:id/status', getBookingStatus);
router.patch('/:id/cancel', cancelBooking);

export default router;
