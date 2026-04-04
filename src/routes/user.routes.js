//src/routes/user.routes.js
import { Router } from "express";
import { register, validateEmail } from "../controllers/user.controller.js";
import { validate } from "../middleware/validate.js";
import { registerSchema, validationCodeSchema, loginSchema } from "../validators/auth.validators.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);

router.put(
  '/validation',
  authMiddleware,
  validate(validationCodeSchema),
  validateEmail
);

export default router;