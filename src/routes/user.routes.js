// src/routes/user.routes.js
import { Router } from 'express';
import {
  register,
  validateEmail,
  login,
  updatePersonalData,
  updateCompany,
  updateLogo,
  getMe,
  refreshToken,
  logout,
  deleteUser,
  inviteUser,
  changePassword,
} from '../controllers/user.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
import checkRol from '../middleware/role.middleware.js';
import uploadMiddleware from '../middleware/uploads.js';
import { validate } from '../middleware/validate.js';
import {
  registerSchema,
  validationCodeSchema,
  loginSchema,
  personalDataSchema,
  companyDataSchema,
  refreshTokenSchema,
  deleteUserSchema,
  inviteUserSchema,
  changePasswordSchema,
} from '../validators/auth.validators.js';

const router = Router();

//publicas
router.post("/register", validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', validate(refreshTokenSchema), refreshToken);

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

router.patch(
  '/company',
  authMiddleware,
  validate(companyDataSchema),
  updateCompany
);

router.patch(
  '/logo',
  authMiddleware,
  uploadMiddleware.single('logo'),
  updateLogo
);

router.get('/me', authMiddleware, getMe);
router.post('/logout', authMiddleware, logout);

router.delete(
  '/delete',
  authMiddleware,
  validate(deleteUserSchema),
  deleteUser
);

router.post(
  '/invite',
  authMiddleware,
  checkRol(['admin']),
  validate(inviteUserSchema),
  inviteUser
);

export default router;