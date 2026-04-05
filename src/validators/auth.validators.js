// src/validators/auth.validators.js
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

const adressSchema = z.object({
  street: z.string().trim().optional(),
  number: z.string().trim().optional(),
  postal: z.string().trim().optional(),
  city: z.string().trim().optional(),
  province: z.string().trim().optional(),
});

export const personalDataSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'El nombre es requerido' })
      .min(2, 'Minimo 2 caracteres')
      .trim(),
    lastName: z
      .string({ required_error: 'Los apellidos son requeridos' })
      .min(2, 'Minimo 2 caracteres')
      .trim(),
    nif: z
      .string({ required_error: 'El NIF es requerido' })
      .min(8, 'NIF no valido')
      .trim()
      .transform((val) => val.toUpperCase()),
  }),
});

export const companyDataSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Minimo 2 caracteres').trim().optional(),
    cif: z
      .string({ required_error: 'El CIF es requerido' })
      .min(8, 'CIF no valido')
      .trim()
      .transform((val) => val.toUpperCase()),
    adress: adressSchema.optional(),
    isFreelancer: z.boolean().optional(),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string({ required_error: 'El refresh token es requerido' }),
  }),
});

export const deleteUserSchema = z.object({
  query: z.object({
    soft: z
      .enum(['true', 'false'])
      .transform((val) => val === 'true')
      .optional(),
  }),
});

export const inviteUserSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'El email es requerido' })
      .email('Email no válido')
      .transform((val) => val.toLowerCase().trim()),
    name: z.string().min(2).trim().optional(),
    lastName: z.string().min(2).trim().optional(),
  }),
});