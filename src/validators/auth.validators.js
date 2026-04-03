// src/validators/user.validator.js
import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'El email es requerido' })
      .email('Email no válido')
      .transform((val) => val.toLowerCase().trim()),
    password: z
      .string({ required_error: 'La contraseña es requerida' })
      .min(8, 'La contraseña debe tener al menos 8 caracteres'),
  }),
});