import { randomInt } from 'node:crypto';
import User from '../models/User.js';
import { encrypt } from '../utils/handlePassword.js';
import { generateAccessToken, generateRefreshToken } from '../utils/handleJwt.js';
import { AppError } from '../utils/AppError.js';
import { notificationService } from '../services/notification.service.js';

export const register = async (req, res) => {
  const { email, password } = req.body;

  const existing = await User.findOne({ email, status: 'verified' });
  if (existing) {
    throw AppError.conflict('Ya existe una cuenta verificada con ese email');
  }

  const hashedPassword = await encrypt(password);
  const verificationCode = String(randomInt(100000, 999999));

  const user = await User.create({
    email,
    password: hashedPassword,
    verificationCode,
    verificationAttempts: 3,
    status: 'pending',
    role: 'admin',
  });

  notificationService.emit('user:registered', {
    email: user.email,
    verificationCode,
  });

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save();

  res.status(201).json({
    accessToken,
    refreshToken,
    user: {
      _id: user._id,
      email: user.email,
      status: user.status,
      role: user.role,
    },
  });
};