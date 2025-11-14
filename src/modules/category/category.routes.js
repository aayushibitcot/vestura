import { Router } from 'express';
import { CategoryController } from './category.controller.js';

const router = Router();

router.get('/', CategoryController.getCategories);

export default router;


