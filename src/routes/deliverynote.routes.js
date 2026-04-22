import { Router } from 'express'
import  authMiddleware  from '../middleware/auth.middleware.js'
import { validate } from '../middleware/validate.js'
import { createDeliveryNoteValidator } from '../validators/deliverynote.validator.js'
import {
  createDeliveryNote,
  getDeliveryNotes,
  getDeliveryNoteById,
  deleteDeliveryNote,
  signDeliveryNote,
  downloadDeliveryNotePdf
} from '../controllers/deliverynote.controller.js'

import { uploadSingle } from '../middleware/uploads.js'

const router = Router()

router.use(authMiddleware)

router.get('/pdf/:id', downloadDeliveryNotePdf)
router.get('/', getDeliveryNotes)
router.get('/:id', getDeliveryNoteById)
router.post('/', validate(createDeliveryNoteValidator), createDeliveryNote)
router.patch('/:id/sign', uploadSingle, signDeliveryNote)
router.delete('/:id', deleteDeliveryNote)


export default router