import { Response } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { AuthRequest } from '../middleware/auth.middleware';
import { prisma } from '../config/prisma';
import { getIO } from '../socket/socket';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bookingId } = req.body;

    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, userId: req.user!.id },
    });

    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found' });
      return;
    }

    if (booking.status !== 'ASSIGNED') {
      res.status(400).json({
        success: false,
        message: 'Collector must be assigned before payment',
      });
      return;
    }

    // Check if payment already exists
    const existingPayment = await prisma.payment.findUnique({
      where: { bookingId },
    });

    if (existingPayment && existingPayment.status === 'SUCCESS') {
      res.status(400).json({ success: false, message: 'Payment already completed' });
      return;
    }

    const amount = Math.round(booking.estimatedPrice * 100); // Razorpay uses paise

    const isMock = process.env.RAZORPAY_KEY_ID?.includes('XXXX');
    let orderId = `order_${crypto.randomBytes(8).toString('hex')}`;

    if (!isMock) {
      const order = await razorpay.orders.create({
        amount,
        currency: 'INR',
        receipt: `tmt_${bookingId.slice(0, 12)}`,
        notes: {
          bookingId,
          userId: req.user!.id,
        },
      });
      orderId = order.id;
    }

    // Upsert payment record
    const payment = await prisma.payment.upsert({
      where: { bookingId },
      create: {
        bookingId,
        orderId,
        amount: booking.estimatedPrice,
        currency: 'INR',
        status: 'PENDING',
      },
      update: {
        orderId,
        status: 'PENDING',
      },
    });

    res.json({
      success: true,
      data: {
        orderId,
        amount: booking.estimatedPrice,
        currency: 'INR',
        keyId: process.env.RAZORPAY_KEY_ID,
        bookingId,
        paymentId: payment.id,
      },
    });
  } catch (error) {
    throw error;
  }
};

export const verifyPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { orderId, paymentId, signature, bookingId } = req.body;

    const isMock = process.env.RAZORPAY_KEY_ID?.includes('XXXX');

    if (!isMock) {
      // Verify Razorpay signature
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      if (expectedSignature !== signature) {
        res.status(400).json({ success: false, message: 'Invalid payment signature' });
        return;
      }
    }

    // Update payment record
    await prisma.payment.update({
      where: { bookingId },
      data: {
        paymentId,
        signature,
        status: 'SUCCESS',
      },
    });

    // Update booking status
    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'IN_PROGRESS' },
    });

    // Notify via Socket.io
    const io = getIO();
    io.to(`booking:${bookingId}`).emit('payment_confirmed', {
      bookingId,
      status: 'IN_PROGRESS',
    });

    res.json({
      success: true,
      message: 'Payment verified successfully',
      data: { bookingId, status: booking.status },
    });
  } catch (error) {
    throw error;
  }
};

export const getPaymentHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const payments = await prisma.payment.findMany({
      where: {
        booking: { userId: req.user!.id },
      },
      include: {
        booking: {
          select: {
            id: true,
            type: true,
            addressLine: true,
            wasteType: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: payments });
  } catch (error) {
    throw error;
  }
};
