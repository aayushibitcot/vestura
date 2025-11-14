import { Router } from 'express';
import { OrderController } from './order.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { createOrderSchema, cancelOrderSchema } from './order.validation.js';

const router = Router();

function validate(schema) {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const err = new Error(error.details.map((d) => d.message).join(', '));
      err.name = 'ValidationError';
      err.status = 422;
      return next(err);
    }
    return next();
  };
}

// All order routes require authentication
router.use(authenticate);

router.post('/', validate(createOrderSchema), OrderController.createOrder);
router.get('/', OrderController.getUserOrders);
router.get('/:orderId', OrderController.getOrderDetails);
router.post('/:orderId/cancel', validate(cancelOrderSchema), OrderController.cancelOrder);

export default router;

