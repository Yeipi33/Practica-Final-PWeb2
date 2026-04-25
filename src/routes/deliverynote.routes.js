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

/**
 * @swagger
 * /api/deliverynote:
 *   post:
 *     summary: Crear un albarán
 *     tags: [Albaranes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [client, project, format, workDate]
 *             properties:
 *               client:      { type: string, example: 664a1b2c3d4e5f6789012345 }
 *               project:     { type: string, example: 664a1b2c3d4e5f6789012346 }
 *               format:      { type: string, enum: [material, hours] }
 *               description: { type: string }
 *               workDate:    { type: string, format: date }
 *               material:    { type: string }
 *               quantity:    { type: number }
 *               unit:        { type: string }
 *               hours:       { type: number }
 *     responses:
 *       201:
 *         description: Albarán creado correctamente
 *       400:
 *         description: Error de validación
 */
router.post('/', validate(createDeliveryNoteValidator), createDeliveryNote)

/**
 * @swagger
 * /api/deliverynote:
 *   get:
 *     summary: Listar albaranes
 *     tags: [Albaranes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: project
 *         schema: { type: string }
 *       - in: query
 *         name: client
 *         schema: { type: string }
 *       - in: query
 *         name: format
 *         schema: { type: string, enum: [material, hours] }
 *       - in: query
 *         name: signed
 *         schema: { type: boolean }
 *       - in: query
 *         name: from
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: to
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: sort
 *         schema: { type: string, default: -workDate }
 *     responses:
 *       200:
 *         description: Lista de albaranes con paginación
 */
router.get('/', getDeliveryNotes)

/**
 * @swagger
 * /api/deliverynote/pdf/{id}:
 *   get:
 *     summary: Descargar albarán en PDF
 *     tags: [Albaranes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: PDF del albarán
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Albarán no encontrado
 */
router.get('/pdf/:id', downloadDeliveryNotePdf)

/**
 * @swagger
 * /api/deliverynote/{id}:
 *   get:
 *     summary: Obtener un albarán por ID
 *     tags: [Albaranes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Albarán encontrado con datos populados
 *       404:
 *         description: Albarán no encontrado
 */
router.get('/:id', getDeliveryNoteById)

/**
 * @swagger
 * /api/deliverynote/{id}/sign:
 *   patch:
 *     summary: Firmar un albarán
 *     tags: [Albaranes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               signature:
 *                 type: string
 *                 format: binary
 *                 description: Imagen de la firma
 *     responses:
 *       200:
 *         description: Albarán firmado correctamente
 *       400:
 *         description: Ya firmado o sin imagen
 *       404:
 *         description: Albarán no encontrado
 */
router.patch('/:id/sign', uploadSingle, signDeliveryNote)

/**
 * @swagger
 * /api/deliverynote/{id}:
 *   delete:
 *     summary: Eliminar un albarán no firmado
 *     tags: [Albaranes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Albarán eliminado
 *       400:
 *         description: No se puede eliminar un albarán firmado
 *       404:
 *         description: Albarán no encontrado
 */
router.delete('/:id', deleteDeliveryNote)

export default router