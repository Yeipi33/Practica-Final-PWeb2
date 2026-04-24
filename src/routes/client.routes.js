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

router.get('/archived', getArchivedClients);
router.patch('/:id/restore', restoreClient);
router.get('/', getClients);
router.get('/:id', getClientById);
router.post('/', validate(createClientValidator), createClient);
router.put('/:id', validate(updateClientValidator), updateClient);
router.delete('/:id', deleteClient);

export default router
