// src/middleware/auth.middleware.js
import User from '../models/Usuario.js';
import { verifyToken } from '../utils/handleJWT.js';
import { AppError } from '../utils/AppError.js';

const authMiddleware = async (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      return next(AppError.unauthorized('Token no proporcionado', 'NOT_TOKEN'));
    }

    const token = req.headers.authorization.split(' ').pop();
    const dataToken = verifyToken(token);

    if (!dataToken?._id) {
      return next(AppError.unauthorized('Token inválido o expirado', 'INVALID_TOKEN'));
    }

    const user = await User.findOne({ _id: dataToken._id, deleted: false });

    if (!user) {
      return next(AppError.unauthorized('Usuario no encontrado', 'USER_NOT_FOUND'));
    }

    req.user = user;
    next();
  } catch (err) {
    next(AppError.unauthorized('Sesión inválida', 'NOT_SESSION'));
  }
};

export { authMiddleware }
export default authMiddleware;