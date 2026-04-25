import {Router} from 'express';
import authMiddleware from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.js'
import { createClientValidator, updateClientValidator } from '../validators/client.validator.js'
import{
    createClient,
    updateClient,
    getClients,
    getClientById,
    deleteClient,
    getArchivedClients,
    restoreClient
} from '../controllers/client.controller.js'

const router = Router()

router.use(authMiddleware)

/**
 * @swagger
 * /api/client:
 *   post:
 *     summary: Crear un cliente
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, cif]
 *             properties:
 *               name:    { type: string, example: Constructora López S.L. }
 *               cif:     { type: string, example: B12345678 }
 *               email:   { type: string, example: lopez@constructora.com }
 *               phone:   { type: string, example: '600123456' }
 *               address: { $ref: '#/components/schemas/Address' }
 *     responses:
 *       201:
 *         description: Cliente creado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:     { type: boolean }
 *                 client: { $ref: '#/components/schemas/Client' }
 *       400:
 *         description: Error de validación o sin compañía
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       409:
 *         description: CIF duplicado en la compañía
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post('/', validate(createClientValidator), createClient)

/**
 * @swagger
 * /api/client:
 *   get:
 *     summary: Listar clientes de la compañía
 *     tags: [Clientes]
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
 *         name: name
 *         schema: { type: string }
 *         description: Búsqueda parcial por nombre
 *       - in: query
 *         name: sort
 *         schema: { type: string, default: createdAt }
 *     responses:
 *       200:
 *         description: Lista de clientes con paginación
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:         { type: boolean }
 *                 clients:    { type: array, items: { $ref: '#/components/schemas/Client' } }
 *                 pagination: { $ref: '#/components/schemas/Pagination' }
 */
router.get('/', getClients)

/**
 * @swagger
 * /api/client/archived:
 *   get:
 *     summary: Listar clientes archivados
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de clientes archivados
 */
router.get('/archived', getArchivedClients)

/**
 * @swagger
 * /api/client/{id}:
 *   get:
 *     summary: Obtener un cliente por ID
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Cliente encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:     { type: boolean }
 *                 client: { $ref: '#/components/schemas/Client' }
 *       404:
 *         description: Cliente no encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.get('/:id', getClientById)

/**
 * @swagger
 * /api/client/{id}:
 *   put:
 *     summary: Actualizar un cliente
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:    { type: string }
 *               cif:     { type: string }
 *               email:   { type: string }
 *               phone:   { type: string }
 *               address: { $ref: '#/components/schemas/Address' }
 *     responses:
 *       200:
 *         description: Cliente actualizado
 *       404:
 *         description: Cliente no encontrado
 */
router.put('/:id', validate(updateClientValidator), updateClient)

/**
 * @swagger
 * /api/client/{id}:
 *   delete:
 *     summary: Eliminar o archivar un cliente
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: soft
 *         schema: { type: boolean }
 *         description: Si true, archiva en lugar de eliminar
 *     responses:
 *       200:
 *         description: Cliente eliminado o archivado
 *       404:
 *         description: Cliente no encontrado
 */
router.delete('/:id', deleteClient)

/**
 * @swagger
 * /api/client/{id}/restore:
 *   patch:
 *     summary: Restaurar un cliente archivado
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Cliente restaurado
 *       404:
 *         description: Cliente archivado no encontrado
 */
router.patch('/:id/restore', restoreClient)

export default router
