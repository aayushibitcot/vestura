import { Router } from 'express';
import { ContactController } from './contact.controller.js';
import { contactSchema } from './contact.validation.js';

const router = Router();

function validate(schema) {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const errors = {};
      error.details.forEach((detail) => {
        const key = detail.path[0];
        if (!errors[key]) {
          errors[key] = detail.message;
        }
      });
      
      return res.status(422).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
    return next();
  };
}

// Public route - no authentication required
router.post('/', validate(contactSchema), ContactController.submitContact);

export default router;

