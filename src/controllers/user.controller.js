// src/controllers/user.controller.js
import { randomInt } from 'node:crypto';
import User from '../models/Usuario.js';
import Company from '../models/Company.js';
import { encrypt, compare } from '../utils/handlePassword.js';
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

export const updatePersonalData = async (req, res) => {
  const { name, lastName, nif } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, lastName, nif },
    { new: true, runValidators: true }
  ).populate('company');

  res.json({ data: user });
};

export const updateCompany = async (req, res) => {
  const { name, cif, address, isFreelance } = req.body;
  const currentUser = req.user;

  let companyData = { name, cif, address, isFreelance };

  // Si es autónomo → usar datos personales del usuario
  if (isFreelance) {
    companyData = {
      name: currentUser.name,
      cif: currentUser.nif,
      address: currentUser.address,
      isFreelance: true,
    };
  }

  // Buscar si ya existe una Company con ese CIF
  const existingCompany = await Company.findOne({ cif: companyData.cif });

  let company;
  let newRole = currentUser.role;

  if (!existingCompany) {
    // No existe → crear nueva, el usuario es owner (admin)
    company = await Company.create({
      ...companyData,
      owner: currentUser._id,
    });
  } else {
    // Ya existe → unirse con role guest
    company = existingCompany;
    newRole = 'guest';
  }

  const user = await User.findByIdAndUpdate(
    currentUser._id,
    { company: company._id, role: newRole },
    { new: true }
  ).populate('company');

  res.json({ data: user });
};

export const updateLogo = async (req, res) => {
  if (!req.file) throw AppError.badRequest('No se ha subido ningún archivo');

  const currentUser = await User.findById(req.user._id).populate('company');

  if (!currentUser.company) {
    throw AppError.badRequest('Debes completar el onboarding de compañía primero');
  }

  const PORT = process.env.PORT || 3000;
  const PUBLIC_URL = process.env.PUBLIC_URL || `http://localhost:${PORT}`;
  const logoUrl = `${PUBLIC_URL}/uploads/${req.file.filename}`;

  const company = await Company.findByIdAndUpdate(
    currentUser.company._id,
    { logo: logoUrl },
    { new: true }
  );

  res.json({ data: company });
};