//src/app.js
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import userRoutes from './routes/user.routes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
}));

app.use(express.json({ limit: '10kb' }));
app.use(mongoSanitize());
app.use('/uploads', express.static('uploads'));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/user', userRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;