import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import authRouter from './routes/authRoutes';
import projectRouter from './routes/projectRoutes';
import { errorHandler } from './middleware/errorHandler';
import { Logger } from './utils/logger';

dotenv.config();

// Security: Force server crash in production if default secrets/encryption keys are used
if (process.env.NODE_ENV === 'production') {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'fallback_secret') {
    Logger.error('FATAL SECURITY ERROR: JWT_SECRET must be configured with a strong secret in production!');
    process.exit(1);
  }
  if (!process.env.ENCRYPTION_KEY) {
    Logger.error('FATAL SECURITY ERROR: ENCRYPTION_KEY must be configured with a strong 32-byte key in production!');
    process.exit(1);
  }
}

const app = express();
const server = http.createServer(app);

const allowedOrigin = process.env.NODE_ENV === 'production'
  ? process.env.FRONTEND_URL
  : '*';

const corsOptions = {
  origin: allowedOrigin || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
};

// Export io so other services can emit live log lines
export const io = new Server(server, {
  cors: corsOptions,
});

app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/projects', projectRouter);

// Socket logic: Stream logs for a container
io.on('connection', (socket) => {
  Logger.info(`Socket client connected: ${socket.id}`);

  socket.on('join-container-logs', (projectId) => {
    Logger.info(`Client requested logs for Project: ${projectId}`);
    socket.join(projectId);
  });
});

app.use(errorHandler);

const prisma = new PrismaClient();
async function selfHealDatabase() {
  try {
    const servers = await prisma.serverInstance.findMany();
    for (const s of servers) {
      if (s.publicIp.includes(':')) {
        const cleanIp = s.publicIp.split(':')[0];
        await prisma.serverInstance.update({
          where: { id: s.id },
          data: { publicIp: cleanIp },
        });
        Logger.info(`Self-healing database: Fixed port suffix on server "${s.name}" IP: ${s.publicIp} -> ${cleanIp}`);
      }
    }
  } catch (err: any) {
    Logger.error('Failed to run self-healing database check', err);
  } finally {
    await prisma.$disconnect();
  }
}

const PORT = process.env.PORT || 4000;
server.listen(PORT, async () => {
  Logger.info(`Socket-enabled Backend server online on port ${PORT}`);
  await selfHealDatabase();
});
