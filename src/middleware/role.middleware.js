//src/middleware/role.middleware.js
//Controlamos que usuarios pueden acceder a ciertas rutas segun su rol
// src/middleware/role.middleware.js
import { AppError } from '../utils/AppError.js';

const checkRol = (roles) => (req, res, next) => {
  try {
    const userRole = req.user?.role;

    if (!userRole || !roles.includes(userRole)) {
      return next(AppError.forbidden('No tienes permisos para esta acción', 'NOT_ALLOWED'));
    }

    next();
  } catch (err) {
    next(AppError.forbidden('Error al verificar permisos', 'ERROR_PERMISSIONS'));
  }
};

export default checkRol;