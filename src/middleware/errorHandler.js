// src/middleware/error-handler.js
import mongoose from 'mongoose';
import { AppError } from '../utils/AppError.js';

export const notFound = (req, res, next) => {
  next(AppError.notFound(`Ruta ${req.method} ${req.originalUrl}`));
};

export const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err.message);

  if (err.isOperational) {
    return res.status(err.statusCode).json({
      error: true,
      message: err.message,
      code: err.code,
    });
  }

  if (err instanceof mongoose.Error.ValidationError) {
    const details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(400).json({
      error: true,
      message: 'Error de validación',
      code: 'VALIDATION_ERROR',
      details,
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    return res.status(409).json({
      error: true,
      message: `Ya existe un registro con ese '${field}'`,
      code: 'DUPLICATE_KEY',
    });
  }

  const isDev = process.env.NODE_ENV === 'development';
  res.status(500).json({
    error: true,
    message: isDev ? err.message : 'Error interno del servidor',
    code: 'INTERNAL_ERROR',
    ...(isDev && { stack: err.stack }),
  });
};