import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma';
import { redis } from '../config/redis';

let io: Server;

export function initSocket(httpServer: HTTPServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
      methods: ['GET', 'POST'],
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Auth middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        userId: string;
        email: string;
      };

      socket.data.userId = decoded.userId;
      socket.data.email = decoded.email;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = socket.data.userId;
    console.log(`🔌 User connected: ${userId} (${socket.id})`);

    // Join user's personal room
    socket.join(`user:${userId}`);

    // === USER APP EVENTS ===

    // Join booking room to receive updates
    socket.on('join_booking_room', async (data: { bookingId: string }) => {
      const { bookingId } = data;

      // Verify the booking belongs to this user
      const booking = await prisma.booking.findFirst({
        where: { id: bookingId, userId },
      });

      if (!booking) {
        socket.emit('error', { message: 'Booking not found' });
        return;
      }

      socket.join(`booking:${bookingId}`);
      console.log(`📍 User ${userId} joined booking room: ${bookingId}`);

      // Send current status immediately
      socket.emit('booking_status', {
        bookingId,
        status: booking.status,
        collectorId: booking.collectorId,
        collectorName: booking.collectorName,
      });
    });

    // Leave booking room
    socket.on('leave_booking_room', (data: { bookingId: string }) => {
      socket.leave(`booking:${data.bookingId}`);
      console.log(`🚪 User ${userId} left booking room: ${data.bookingId}`);
    });

    // === COLLECTOR APP EVENTS ===
    // These events are emitted BY the collector app and forwarded to the user

    // Collector sends their location update
    socket.on(
      'collector_location_update',
      async (data: {
        bookingId: string;
        collectorId: string;
        lat: number;
        lng: number;
        heading?: number;
        speed?: number;
        eta?: number;
      }) => {
        const { bookingId, collectorId, lat, lng, heading, speed, eta } = data;

        // Store in Redis for REST fallback
        await redis.setex(
          `collector:location:${collectorId}`,
          300, // 5 min TTL
          JSON.stringify({ lat, lng, heading, speed, eta, updatedAt: new Date() })
        );

        // Forward location to users watching this booking
        io.to(`booking:${bookingId}`).emit('collector_location', {
          lat,
          lng,
          heading,
          speed,
          eta,
        });
      }
    );

    // Collector marks pickup as started
    socket.on('pickup_started', async (data: { bookingId: string }) => {
      await prisma.booking.update({
        where: { id: data.bookingId },
        data: { status: 'IN_PROGRESS' },
      });

      io.to(`booking:${data.bookingId}`).emit('pickup_started', {
        bookingId: data.bookingId,
        timestamp: new Date(),
      });
    });

    // Collector marks pickup as completed
    socket.on('pickup_completed', async (data: { bookingId: string; finalPrice?: number }) => {
      await prisma.booking.update({
        where: { id: data.bookingId },
        data: {
          status: 'COMPLETED',
          ...(data.finalPrice && { finalPrice: data.finalPrice }),
        },
      });

      io.to(`booking:${data.bookingId}`).emit('pickup_completed', {
        bookingId: data.bookingId,
        timestamp: new Date(),
        finalPrice: data.finalPrice,
      });
    });

    socket.on('disconnect', (reason) => {
      console.log(`🔌 User disconnected: ${userId} — ${reason}`);
    });
  });

  return io;
}

export function getIO(): Server {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
}
