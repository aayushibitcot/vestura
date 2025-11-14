// Utility functions to format order data according to API spec

export function formatOrderItem(orderItem) {
  const product = orderItem.product;
  const price = parseFloat(orderItem.price);
  const quantity = orderItem.quantity;
  const subtotal = price * quantity;

  return {
    id: `order_item_${orderItem.id}`,
    product: {
      sku: `PROD-${String(product.id).padStart(3, '0')}`,
      name: product.name,
      price,
      image: product.image || null,
    },
    quantity,
    selectedSize: orderItem.selectedSize || null,
    selectedColor: orderItem.selectedColor || null,
    price,
    subtotal: parseFloat(subtotal.toFixed(2)),
  };
}

export function formatOrderItemSummary(orderItem) {
  const product = orderItem.product;
  const price = parseFloat(orderItem.price);

  return {
    id: `order_item_${orderItem.id}`,
    product: {
      name: product.name,
      image: product.image || null,
    },
    quantity: orderItem.quantity,
    price,
    selectedSize: orderItem.selectedSize || null,
    selectedColor: orderItem.selectedColor || null,
  };
}

export function formatOrder(order) {
  if (!order) return null;

  const items = (order.items || []).map(formatOrderItem);
  
  // Parse addresses from JSON strings
  let shippingAddress = null;
  let billingAddress = null;
  
  try {
    shippingAddress = order.shippingAddress ? JSON.parse(order.shippingAddress) : null;
    billingAddress = order.billingAddress ? JSON.parse(order.billingAddress) : null;
  } catch (e) {
    // If parsing fails, addresses remain null
  }

  // Use stored values from order
  const subtotal = parseFloat(order.subtotal || 0);
  const shipping = parseFloat(order.shipping || 0);
  const tax = parseFloat(order.tax || 0);
  const discount = parseFloat(order.discount || 0);
  const total = parseFloat(order.totalAmount);

  // Calculate estimated delivery (7 days from order date)
  const estimatedDelivery = order.estimatedDelivery 
    ? new Date(order.estimatedDelivery).toISOString()
    : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  return {
    id: `order_${order.id}`,
    orderNumber: order.orderNumber,
    userId: `user_${order.userId}`,
    status: order.status,
    items,
    subtotal: parseFloat(subtotal.toFixed(2)),
    shipping: parseFloat(shipping.toFixed(2)),
    tax: parseFloat(tax.toFixed(2)),
    discount: parseFloat(discount.toFixed(2)),
    total: parseFloat(order.totalAmount),
    shippingAddress,
    billingAddress,
    paymentMethod: order.paymentMethod || null,
    paymentStatus: order.paymentStatus,
    deliveryStatus: order.deliveryStatus,
    trackingNumber: order.trackingNumber || null,
    estimatedDelivery,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  };
}

export function formatOrderSummary(order) {
  if (!order) return null;

  const items = (order.items || []).map(formatOrderItemSummary);
  
  // Parse addresses if needed
  let shippingAddress = null;
  try {
    shippingAddress = order.shippingAddress ? JSON.parse(order.shippingAddress) : null;
  } catch (e) {
    // If parsing fails, address remains null
  }

  const subtotal = parseFloat(order.subtotal || 0);
  const shipping = parseFloat(order.shipping || 0);
  const tax = parseFloat(order.tax || 0);
  const total = parseFloat(order.totalAmount);

  return {
    id: `order_${order.id}`,
    orderNumber: order.orderNumber,
    date: order.createdAt.toISOString().split('T')[0],
    total,
    subtotal: parseFloat(subtotal.toFixed(2)),
    shipping: parseFloat(shipping.toFixed(2)),
    tax: parseFloat(tax.toFixed(2)),
    paymentStatus: order.paymentStatus,
    deliveryStatus: order.deliveryStatus,
    items,
  };
}

