import { Router } from 'express';
import { UserController } from './user.controller.js';
import { updateUserSchema } from './user.validation.js';

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

router.get('/:id', UserController.getUserById);
router.put('/:id', validate(updateUserSchema), UserController.updateUser);

export default router;

