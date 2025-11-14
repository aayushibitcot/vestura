import Joi from 'joi';

const addressSchema = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  address: Joi.string().required(),
  city: Joi.string().required(),
  state: Joi.string().required(),
  zip: Joi.string().required(),
  country: Joi.string().required(),
  phone: Joi.string().optional(),
});

const orderItemSchema = Joi.object({
  productSku: Joi.string().pattern(/^PROD-\d+$/).required()
    .messages({
      'string.pattern.base': 'Invalid SKU format. Expected format: PROD-XXX',
      'any.required': 'productSku is required',
    }),
  quantity: Joi.number().integer().min(1).required()
    .messages({
      'number.base': 'Quantity must be a number',
      'number.integer': 'Quantity must be an integer',
      'number.min': 'Quantity must be at least 1',
      'any.required': 'quantity is required',
    }),
  selectedSize: Joi.string().trim().min(1).required()
    .messages({
      'string.base': 'selectedSize must be a string',
      'string.empty': 'selectedSize is required and cannot be empty',
      'any.required': 'selectedSize is required',
    }),
  selectedColor: Joi.string().trim().min(1).required()
    .messages({
      'string.base': 'selectedColor must be a string',
      'string.empty': 'selectedColor is required and cannot be empty',
      'any.required': 'selectedColor is required',
    }),
});

export const createOrderSchema = Joi.object({
  items: Joi.array().items(orderItemSchema).min(1).required()
    .messages({
      'array.base': 'items must be an array',
      'array.min': 'Order must contain at least one item',
      'any.required': 'items is required',
    }),
  shippingAddress: addressSchema.required()
    .messages({
      'any.required': 'shippingAddress is required',
    }),
  billingAddress: addressSchema.required()
    .messages({
      'any.required': 'billingAddress is required',
    }),
  paymentMethod: Joi.string().valid('stripe', 'credit_card', 'debit_card', 'upi', 'wallet').optional(),
  couponCode: Joi.string().optional(),
  stripeSessionId: Joi.string().optional(),
});

export const cancelOrderSchema = Joi.object({
  reason: Joi.string().optional(),
});

