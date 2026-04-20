import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { validate } from '../middleware/validate.js'
import { createDeliveryNoteValidator } from '../validators/deliverynote.validator.js'
import {
  createDeliveryNote,
  getDeliveryNotes,
  getDeliveryNoteById,
  deleteDeliveryNote
} from '../controllers/deliverynote.controller.js'

const router = Router()

router.use(authMiddleware)

router.get('/',      getDeliveryNotes)
router.get('/:id',   getDeliveryNoteById)
router.post('/',     validate(createDeliveryNoteValidator), createDeliveryNote)
router.delete('/:id', deleteDeliveryNote)

export default router