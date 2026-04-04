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

export const validationCodeSchema = z.object({
  body: z.object({
    code: z
      .string({ required_error: 'El código es requerido' })
      .length(6, 'El código debe tener exactamente 6 dígitos')
      .regex(/^\d{6}$/, 'El código debe contener solo dígitos'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'El email es requerido' })
      .email('Email no válido')
      .transform((val) => val.toLowerCase().trim()),
    password: z
      .string({ required_error: 'La contraseña es requerida' })
      .min(8, 'Mínimo 8 caracteres'),
  }),
});