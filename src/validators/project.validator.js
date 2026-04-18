import { z } from 'zod'

const addressSchema = z.object({
  street:   z.string().optional(),
  number:   z.string().optional(),
  postal:   z.string().optional(),
  city:     z.string().optional(),
  province: z.string().optional()
}).optional()

export const createProjectValidator = z.object({
  client:      z.string().min(1, 'El cliente es obligatorio'),
  name:        z.string().min(2, 'El nombre es obligatorio'),
  projectCode: z.string().min(1, 'El código de proyecto es obligatorio'),
  address:     addressSchema,
  email:       z.string().email('Email no válido').optional(),
  notes:       z.string().optional()
})

export const updateProjectValidator = createProjectValidator.partial()