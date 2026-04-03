//src/routes/user.routes.js
import { Router } from "express";
import { register } from "../controllers/user.controller.js";
import { validate } from "../middleware/validate.js";
import { registerSchema } from "../validators/auth.validators.js";

const Router = Router();

Router.post("/register", validate(registerSchema), register);

export default Router;