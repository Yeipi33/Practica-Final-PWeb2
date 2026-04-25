import { z } from 'zod'

const workerSchema = z.object({
  name:  z.string().min(1),
  hours: z.number().min(0)
})

const deliveryNoteBase = z.object({
  client:      z.string().min(1, 'El cliente es obligatorio'),
  project:     z.string().min(1, 'El proyecto es obligatorio'),
  format:      z.enum(['material', 'hours']),
  description: z.string().optional(),
  workDate:    z.string().min(1, 'La fecha de trabajo es obligatoria'),
  material:    z.string().optional(),
  quantity:    z.number().min(0).optional(),
  unit:        z.string().optional(),
  hours:       z.number().min(0).optional(),
  workers:     z.array(workerSchema).optional()
})

export const createDeliveryNoteValidator = z.object({
  body: deliveryNoteBase.refine(data => {
    if (data.format === 'material') return !!data.material
    if (data.format === 'hours') return !!data.hours || (data.workers && data.workers.length > 0)
    return true
  }, { message: 'Debes rellenar los campos correspondientes al formato elegido' })
})

export const updateDeliveryNoteValidator = z.object({
  body: deliveryNoteBase.partial()
})