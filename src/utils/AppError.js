export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // Diferencia errores de código vs errores de usuario
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(msg) { return new AppError(msg, 400); }
  static notFound(msg = 'Recurso no encontrado') { return new AppError(msg, 404); }
  static internal(msg = 'Error interno del servidor') { return new AppError(msg, 500); }
}