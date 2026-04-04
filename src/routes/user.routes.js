// src/routes/user.routes.js
import { Router } from 'express';
import authMiddleware from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.js';
import {
  register,
  validateEmail,
  updatePersonalData,
  updateCompany,
} from '../controllers/user.controller.js';
import {
  registerSchema,
  validationCodeSchema,
  loginSchema,
  personalDataSchema,
  companyDataSchema,
} from '../validators/auth.validators.js';

const router = Router();

//publicas
router.post("/register", validate(registerSchema), register);
//router.post('/login', validate(loginSchema), login);

//protegidas
router.put(
  '/validation',
  authMiddleware,
  validate(validationCodeSchema),
  validateEmail
);

router.put(
  '/register',
  authMiddleware,
  validate(personalDataSchema),
  updatePersonalData
);

router.put(
  '/company',
  authMiddleware,
  validate(companyDataSchema),
  updateCompany
);

export default router;