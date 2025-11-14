import { OrderModel } from './order.model.js';
import { prisma } from '../../config/db.js';
import { formatOrder, formatOrderSummary } from './order.util.js';

export const OrderService = {
  async createOrder(userId, orderData) {
    const { items, shippingAddress, billingAddress, paymentMethod, couponCode, stripeSessionId } = orderData;

    // Validate items
    if (!items || items.length === 0) {
      const err = new Error('Order must contain at least one item');
      err.name = 'ValidationError';
      err.status = 400;
      throw err;
    }

    // Process items and validate products
    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const { productSku, quantity, selectedSize, selectedColor } = item;

      // Extract product ID from SKU
      const idMatch = productSku.match(/^PROD-(\d+)$/);
      if (!idMatch) {
        const err = new Error(`Invalid SKU format: ${productSku}`);
        err.name = 'ValidationError';
        err.status = 400;
        throw err;
      }

      const productId = parseInt(idMatch[1], 10);

      // Get product
      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        const err = new Error(`Product not found: ${productSku}`);
        err.name = 'PRODUCT_NOT_FOUND';
        err.status = 404;
        throw err;
      }

      if (!product.isActive) {
        const err = new Error(`Product is not available: ${productSku}`);
        err.name = 'PRODUCT_NOT_AVAILABLE';
        err.status = 400;
        throw err;
      }

      if (product.stock < quantity) {
        const err = new Error(`Insufficient stock for product: ${productSku}`);
        err.name = 'OUT_OF_STOCK';
        err.status = 400;
        throw err;
      }

      // Validate size and color
      if (selectedSize && product.sizes && product.sizes.length > 0 && !product.sizes.includes(selectedSize)) {
        const err = new Error(`Invalid size selected for product: ${productSku}`);
        err.name = 'INVALID_SIZE';
        err.status = 400;
        throw err;
      }

      if (selectedColor && product.colors && product.colors.length > 0 && !product.colors.includes(selectedColor)) {
        const err = new Error(`Invalid color selected for product: ${productSku}`);
        err.name = 'INVALID_COLOR';
        err.status = 400;
        throw err;
      }

      const price = parseFloat(product.price);
      const itemSubtotal = price * quantity;
      subtotal += itemSubtotal;

      orderItems.push({
        productId,
        quantity,
        price,
        selectedSize: selectedSize || null,
        selectedColor: selectedColor || null,
      });

      // Update product stock
      await prisma.product.update({
        where: { id: productId },
        data: { stock: { decrement: quantity } },
      });
    }

    // Calculate shipping and tax
    const shipping = 5.99; // Default shipping
    const tax = parseFloat((subtotal * 0.083).toFixed(2)); // 8.3% tax

    // Apply coupon discount if provided
    let discount = 0;
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode },
      });

      if (coupon && coupon.isActive) {
        const now = new Date();
        if (now >= coupon.validFrom && now <= coupon.validUntil) {
          if (!coupon.maxUses || coupon.usedCount < coupon.maxUses) {
            discount = parseFloat(coupon.discount);
            // Update coupon usage
            await prisma.coupon.update({
              where: { id: coupon.id },
              data: { usedCount: { increment: 1 } },
            });
          }
        }
      }
    }

    const total = parseFloat((subtotal + shipping + tax - discount).toFixed(2));

    // Generate order number
    const orderNumber = await OrderModel.generateOrderNumber();

    // Create order
    const order = await OrderModel.create({
      userId,
      orderNumber,
      totalAmount: total,
      subtotal: parseFloat(subtotal.toFixed(2)),
      shipping: parseFloat(shipping.toFixed(2)),
      tax: parseFloat(tax.toFixed(2)),
      discount: parseFloat(discount.toFixed(2)),
      status: 'pending',
      paymentStatus: 'unpaid',
      deliveryStatus: 'processing',
      shippingAddress: shippingAddress ? JSON.stringify(shippingAddress) : null,
      billingAddress: billingAddress ? JSON.stringify(billingAddress) : null,
      paymentMethod: paymentMethod || null,
      couponCode: couponCode || null,
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      items: {
        create: orderItems,
      },
      payment: paymentMethod ? {
        create: {
          userId,
          amount: total,
          paymentMethod,
          status: 'pending',
          stripeSessionId: stripeSessionId || null,
        },
      } : undefined,
    });

    return formatOrder(order);
  },

  async getUserOrders(userId, query = {}) {
    const {
      page = 1,
      limit = 20,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);
    const skip = (pageNumber - 1) * pageSize;

    // Build where clause
    const where = {};
    if (status) {
      where.status = status;
    }

    // Build orderBy clause
    const orderBy = {};
    const validSortFields = ['createdAt', 'totalAmount'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    orderBy[sortField] = sortOrder.toLowerCase() === 'asc' ? 'asc' : 'desc';

    // Get orders and total count
    const [orders, total] = await Promise.all([
      OrderModel.findByUserId(userId, {
        where,
        orderBy,
        skip,
        take: pageSize,
      }),
      OrderModel.countByUserId(userId, where),
    ]);

    const formattedOrders = orders.map(formatOrderSummary);

    return {
      orders: formattedOrders,
      pagination: {
        page: pageNumber,
        limit: pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  },

  async getOrderDetails(userId, orderId) {
    // Extract numeric ID from order_XXX format or use numeric ID directly
    let numericId;
    const idMatch = orderId.match(/^order_(\d+)$/);
    if (idMatch) {
      numericId = parseInt(idMatch[1], 10);
    } else if (/^\d+$/.test(orderId)) {
      numericId = parseInt(orderId, 10);
    } else {
      // Try order number
      const order = await OrderModel.findByOrderNumber(orderId);
      if (!order) {
        const err = new Error('Order not found');
        err.name = 'ORDER_NOT_FOUND';
        err.status = 404;
        throw err;
      }
      if (order.userId !== userId) {
        const err = new Error('Unauthorized');
        err.name = 'UNAUTHORIZED';
        err.status = 403;
        throw err;
      }
      return formatOrder(order);
    }

    const order = await OrderModel.findById(numericId);
    if (!order) {
      const err = new Error('Order not found');
      err.name = 'ORDER_NOT_FOUND';
      err.status = 404;
      throw err;
    }

    if (order.userId !== userId) {
      const err = new Error('Unauthorized');
      err.name = 'UNAUTHORIZED';
      err.status = 403;
      throw err;
    }

    return formatOrder(order);
  },

  async cancelOrder(userId, orderId, reason) {
    // Extract numeric ID from order_XXX format or use numeric ID directly
    let numericId;
    const idMatch = orderId.match(/^order_(\d+)$/);
    if (idMatch) {
      numericId = parseInt(idMatch[1], 10);
    } else if (/^\d+$/.test(orderId)) {
      numericId = parseInt(orderId, 10);
    } else {
      const err = new Error('Invalid order ID format');
      err.name = 'ValidationError';
      err.status = 400;
      throw err;
    }

    const order = await OrderModel.findById(numericId);
    if (!order) {
      const err = new Error('Order not found');
      err.name = 'ORDER_NOT_FOUND';
      err.status = 404;
      throw err;
    }

    if (order.userId !== userId) {
      const err = new Error('Unauthorized');
      err.name = 'UNAUTHORIZED';
      err.status = 403;
      throw err;
    }

    // Check if order can be cancelled
    if (order.status === 'cancelled') {
      const err = new Error('Order is already cancelled');
      err.name = 'ORDER_ALREADY_CANCELLED';
      err.status = 400;
      throw err;
    }

    if (order.deliveryStatus === 'shipped' || order.deliveryStatus === 'out_for_delivery' || order.deliveryStatus === 'delivered') {
      const err = new Error('Order cannot be cancelled. It has already been shipped.');
      err.name = 'ORDER_CANNOT_BE_CANCELLED';
      err.status = 400;
      throw err;
    }

    // Restore product stock
    for (const item of order.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      });
    }

    // Update order status
    const updatedOrder = await OrderModel.update(numericId, {
      status: 'cancelled',
      notes: reason ? `Cancelled: ${reason}` : 'Order cancelled',
    });

    return formatOrder(updatedOrder);
  },
};

