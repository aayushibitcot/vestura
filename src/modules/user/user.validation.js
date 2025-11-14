import Joi from 'joi';

export const updateUserSchema = Joi.object({
  firstName: Joi.string().optional(),
  lastName: Joi.string().optional(),
  phone: Joi.string().optional(),
  avatar: Joi.string().allow(null, '').optional(),
});


