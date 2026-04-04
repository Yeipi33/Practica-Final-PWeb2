import { randomInt } from 'node:crypto';
import User from '../models/Usuario.js';
import { encrypt , compare} from '../utils/handlePassword.js';
import { generateAccessToken, generateRefreshToken } from '../utils/handleJWT.js';
import { AppError } from '../utils/AppError.js';
//import { notificationService } from '../services/notification.service.js';

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

export const validateEmail = async (req, res) => {
  const { code } = req.body;

  const user = await User.findById(req.user._id).select(
    '+verificationCode +verificationAttempts'
  );

  if (!user) throw AppError.notFound('Usuario');

  if (user.status === 'verified') {
    throw AppError.badRequest('El email ya está verificado');
  }

  if (user.verificationAttempts <= 0) {
    throw AppError.tooManyRequests('Has agotado los intentos de verificación');
  }

  if (user.verificationCode !== code) {
    user.verificationAttempts -= 1;
    await user.save();

    if (user.verificationAttempts <= 0) {
      throw AppError.tooManyRequests('Código incorrecto. Has agotado los intentos');
    }

    throw AppError.badRequest(
      `Código incorrecto. Te quedan ${user.verificationAttempts} intentos`
    );
  }

  user.status = 'verified';
  user.verificationCode = undefined;
  user.verificationAttempts = undefined;
  await user.save();

  notificationService.emit('user:verified', { email: user.email });

  res.json({ message: 'Email verificado correctamente' });
};