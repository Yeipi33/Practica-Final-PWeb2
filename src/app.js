//src/app.js
import mongoose from 'mongoose'
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const swaggerUi = require('swagger-ui-express')
import swaggerSpec from './config/swagger.js'
import userRoutes from './routes/user.routes.js'
import clientRoutes from './routes/client.routes.js'
import projectRoutes from './routes/project.routes.js'
import deliveryNoteRoutes from './routes/deliverynote.routes.js'
import { notFound, errorHandler } from './middleware/errorHandler.js'
import { verifyToken } from './utils/handleJWT.js'

const app = express();
const httpServer = createServer(app)

const io = new Server(httpServer, {
  cors: { origin: '*' }
})

io.use((socket, next) => {
  const token = socket.handshake.auth?.token
  if (!token) return next(new Error('Token no proporcionado'))

  const decoded = verifyToken(token)
  if (!decoded?._id) return next(new Error('Token inválido'))

  socket.user = decoded
  next()
})

io.on('connection', (socket) => {
  const companyId = socket.user?.company
  if (companyId) {
    socket.join(`company:${companyId}`)
    console.log(`Usuario conectado a room company:${companyId}`)
  }

  socket.on('disconnect', () => {
    console.log('Usuario desconectado')
  })
})

export { io }

app.use(helmet());
app.use(cors());

app.use(express.json({ limit: '10kb' }));
app.use('/uploads', express.static('uploads'));

app.get('/health', (req, res) => {
  const dbState = mongoose.connection.readyState
  const dbStatus = dbState === 1 ? 'connected' : 'disconnected'

  res.json({
    status: 'ok',
    db: dbStatus,
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  })
})

app.use('/api/user', userRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/project', projectRoutes);
app.use('/api/deliverynote', deliveryNoteRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(notFound);
app.use(errorHandler);

export { httpServer }
export default app;