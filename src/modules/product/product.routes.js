import { Router } from 'express';
import { ProductController } from './product.controller.js';

const router = Router();

router.get('/', ProductController.getProducts);
router.get('/category/:category', ProductController.getProductsByCategory);
router.get('/:sku', ProductController.getProductBySku);

export default router;

