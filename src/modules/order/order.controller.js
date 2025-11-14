import { OrderService } from './order.service.js';
import { successResponse } from '../../utils/response.util.js';

export const OrderController = {
  async createOrder(req, res, next) {
    try {
      const userId = req.user.id;
      const order = await OrderService.createOrder(userId, req.body);
      return successResponse(res, 'Order created successfully', order);
    } catch (err) {
      return next(err);
    }
  },

  async getUserOrders(req, res, next) {
    try {
      const userId = req.user.id;
      const result = await OrderService.getUserOrders(userId, req.query);
      return successResponse(res, 'Orders fetched successfully', result);
    } catch (err) {
      return next(err);
    }
  },

  async getOrderDetails(req, res, next) {
    try {
      const userId = req.user.id;
      const { orderId } = req.params;
      const order = await OrderService.getOrderDetails(userId, orderId);
      return successResponse(res, 'Order fetched successfully', order);
    } catch (err) {
      return next(err);
    }
  },

  async cancelOrder(req, res, next) {
    try {
      const userId = req.user.id;
      const { orderId } = req.params;
      const { reason } = req.body;
      const order = await OrderService.cancelOrder(userId, orderId, reason);
      return successResponse(res, 'Order cancelled successfully', {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
      });
    } catch (err) {
      return next(err);
    }
  },
};

