import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { prisma } from '../config/prisma';
import { getIO } from '../socket/socket';

export const submitRating = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bookingId, stars, comment } = req.body;

    if (!stars || stars < 1 || stars > 5) {
      res.status(400).json({ success: false, message: 'Stars must be between 1 and 5' });
      return;
    }

    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, userId: req.user!.id, status: 'COMPLETED' },
    });

    if (!booking) {
      res.status(404).json({
        success: false,
        message: 'Booking not found or not completed yet',
      });
      return;
    }

    const existing = await prisma.rating.findUnique({ where: { bookingId } });
    if (existing) {
      res.status(409).json({ success: false, message: 'Already rated this booking' });
      return;
    }

    const rating = await prisma.rating.create({
      data: {
        bookingId,
        userId: req.user!.id,
        stars,
        comment,
      },
    });

    // Notify collector app via socket (they subscribe to their own room)
    if (booking.collectorId) {
      const io = getIO();
      io.to(`collector:${booking.collectorId}`).emit('new_rating', {
        bookingId,
        stars,
        comment,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Rating submitted successfully',
      data: rating,
    });
  } catch (error) {
    throw error;
  }
};

export const getCollectorLocation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { collectorId } = req.params;

    // Collector location is stored in Redis by the collector app
    // Key format: collector:location:{collectorId}
    const { redis } = await import('../config/redis');
    const locationData = await redis.get(`collector:location:${collectorId}`);

    if (!locationData) {
      res.status(404).json({ success: false, message: 'Collector location not available' });
      return;
    }

    res.json({ success: true, data: JSON.parse(locationData) });
  } catch (error) {
    throw error;
  }
};
