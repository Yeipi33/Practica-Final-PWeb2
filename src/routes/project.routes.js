import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.middleware.js'
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

router.get('/archived',      getArchivedProjects)
router.patch('/:id/restore', restoreProject)
router.get('/',              getProjects)
router.get('/:id',           getProjectById)
router.post('/',             validate(createProjectValidator), createProject)
router.put('/:id',           validate(updateProjectValidator), updateProject)
router.delete('/:id',        deleteProject)

export default router