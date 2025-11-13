import { Router } from 'express';
import { UserController } from './user.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = Router();

router.get('/:id', UserController.getUserById);

export default router;

