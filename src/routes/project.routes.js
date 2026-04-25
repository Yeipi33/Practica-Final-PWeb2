import { Router } from 'express'
import authMiddleware from '../middleware/auth.middleware.js'
import { validate } from '../middleware/validate.js'
import { createProjectValidator, updateProjectValidator } from '../validators/project.validator.js'
import {
  createProject,
  updateProject,
  getProjects,
  getProjectById,
  deleteProject,
  getArchivedProjects,
  restoreProject
} from '../controllers/project.controller.js'

const router = Router()

router.use(authMiddleware)

/**
 * @swagger
 * /api/project:
 *   post:
 *     summary: Crear un proyecto
 *     tags: [Proyectos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [client, name, projectCode]
 *             properties:
 *               client:      { type: string, example: 664a1b2c3d4e5f6789012345 }
 *               name:        { type: string, example: Reforma Oficinas Centro }
 *               projectCode: { type: string, example: PROJ-001 }
 *               email:       { type: string, example: obra@lopez.com }
 *               notes:       { type: string, example: Acceso por puerta trasera }
 *               address:     { $ref: '#/components/schemas/Address' }
 *     responses:
 *       201:
 *         description: Proyecto creado correctamente
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Cliente no encontrado
 *       409:
 *         description: Código de proyecto duplicado
 */
router.post('/', validate(createProjectValidator), createProject)

/**
 * @swagger
 * /api/project:
 *   get:
 *     summary: Listar proyectos de la compañía
 *     tags: [Proyectos]
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
 *         name: client
 *         schema: { type: string }
 *       - in: query
 *         name: name
 *         schema: { type: string }
 *       - in: query
 *         name: active
 *         schema: { type: boolean }
 *       - in: query
 *         name: sort
 *         schema: { type: string, default: -createdAt }
 *     responses:
 *       200:
 *         description: Lista de proyectos con paginación
 */
router.get('/', getProjects)

/**
 * @swagger
 * /api/project/archived:
 *   get:
 *     summary: Listar proyectos archivados
 *     tags: [Proyectos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de proyectos archivados
 */
router.get('/archived', getArchivedProjects)

/**
 * @swagger
 * /api/project/{id}:
 *   get:
 *     summary: Obtener un proyecto por ID
 *     tags: [Proyectos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Proyecto encontrado
 *       404:
 *         description: Proyecto no encontrado
 */
router.get('/:id', getProjectById)

/**
 * @swagger
 * /api/project/{id}:
 *   put:
 *     summary: Actualizar un proyecto
 *     tags: [Proyectos]
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
 *               name:        { type: string }
 *               projectCode: { type: string }
 *               email:       { type: string }
 *               notes:       { type: string }
 *               active:      { type: boolean }
 *     responses:
 *       200:
 *         description: Proyecto actualizado
 *       404:
 *         description: Proyecto no encontrado
 */
router.put('/:id', validate(updateProjectValidator), updateProject)

/**
 * @swagger
 * /api/project/{id}:
 *   delete:
 *     summary: Eliminar o archivar un proyecto
 *     tags: [Proyectos]
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
 *     responses:
 *       200:
 *         description: Proyecto eliminado o archivado
 *       404:
 *         description: Proyecto no encontrado
 */
router.delete('/:id', deleteProject)

/**
 * @swagger
 * /api/project/{id}/restore:
 *   patch:
 *     summary: Restaurar un proyecto archivado
 *     tags: [Proyectos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Proyecto restaurado
 *       404:
 *         description: Proyecto archivado no encontrado
 */
router.patch('/:id/restore', restoreProject)

export default router