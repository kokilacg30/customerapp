import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { prisma } from '../config/prisma';
import { getIO } from '../socket/socket';

const BASE_PRICE = parseFloat(process.env.BASE_PRICE || '49');
const PRICE_PER_KM = parseFloat(process.env.PRICE_PER_KM || '10');

// Simple price calculation: flat base + distance estimate
function calculatePrice(wasteType: string, quantity: string): number {
  const quantityMultiplier: Record<string, number> = {
    small: 1,
    medium: 1.5,
    large: 2,
    bulk: 3,
  };
  const wasteMultiplier: Record<string, number> = {
    general: 1,
    recyclable: 0.8,
    organic: 0.9,
    hazardous: 2,
    electronic: 1.8,
  };

  const qMult = quantityMultiplier[quantity.toLowerCase()] || 1;
  const wMult = wasteMultiplier[wasteType.toLowerCase()] || 1;

  return Math.round(BASE_PRICE * qMult * wMult);
}

export const createBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      type,
      addressLine,
      landmark,
      latitude,
      longitude,
      wasteType,
      quantity,
      notes,
      scheduledAt,
    } = req.body;

    if (type === 'SCHEDULED' && !scheduledAt) {
      res.status(400).json({ success: false, message: 'scheduledAt is required for scheduled pickups' });
      return;
    }

    const estimatedPrice = calculatePrice(wasteType, quantity);

    const booking = await prisma.booking.create({
      data: {
        userId: req.user!.id,
        type,
        addressLine,
        landmark,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        wasteType,
        quantity,
        notes,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        estimatedPrice,
      },
    });

    // For IMMEDIATE bookings, simulate collector assignment (in production, this
    // would be handled by a matching service / collector app)
    if (type === 'IMMEDIATE') {
      // In production: emit to available collectors via Socket.io
      // For now, we auto-assign after a delay (demo purposes)
      setTimeout(async () => {
        try {
          const updated = await prisma.booking.update({
            where: { id: booking.id },
            data: {
              status: 'ASSIGNED',
              collectorId: 'demo-collector-id',
              collectorName: 'Ravi Kumar',
              collectorPhone: '9876543210',
              collectorAvatar: null,
              collectorRating: 4.7,
            },
          });

          const io = getIO();
          io.to(`booking:${booking.id}`).emit('booking_assigned', {
            bookingId: booking.id,
            collectorId: updated.collectorId,
            collectorName: updated.collectorName,
            collectorPhone: updated.collectorPhone,
            collectorRating: updated.collectorRating,
            estimatedPrice: updated.estimatedPrice,
            eta: 15, // minutes
          });
        } catch (err) {
          console.error('Auto-assign error:', err);
        }
      }, 8000); // 8 second delay to simulate matching
    }

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking,
    });
  } catch (error) {
    throw error;
  }
};

export const getBookings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where: { userId: req.user!.id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: { payment: true, rating: true },
      }),
      prisma.booking.count({ where: { userId: req.user!.id } }),
    ]);

    res.json({
      success: true,
      data: {
        bookings,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    throw error;
  }
};

export const getBookingById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const booking = await prisma.booking.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
      include: { payment: true, rating: true },
    });

    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found' });
      return;
    }

    res.json({ success: true, data: booking });
  } catch (error) {
    throw error;
  }
};

export const cancelBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const booking = await prisma.booking.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
    });

    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found' });
      return;
    }

    if (['COMPLETED', 'CANCELLED', 'IN_PROGRESS'].includes(booking.status)) {
      res.status(400).json({
        success: false,
        message: `Cannot cancel a booking with status: ${booking.status}`,
      });
      return;
    }

    const updated = await prisma.booking.update({
      where: { id: req.params.id },
      data: { status: 'CANCELLED' },
    });

    const io = getIO();
    io.to(`booking:${req.params.id}`).emit('booking_cancelled', {
      bookingId: req.params.id,
      reason: 'Cancelled by user',
    });

    res.json({ success: true, message: 'Booking cancelled', data: updated });
  } catch (error) {
    throw error;
  }
};

export const getBookingStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const booking = await prisma.booking.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
      select: {
        id: true,
        status: true,
        collectorId: true,
        collectorName: true,
        collectorPhone: true,
        collectorRating: true,
        estimatedPrice: true,
        finalPrice: true,
      },
    });

    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found' });
      return;
    }

    res.json({ success: true, data: booking });
  } catch (error) {
    throw error;
  }
};
