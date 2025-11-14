// Utility functions to format product data according to API spec

export function formatProduct(product) {
  // Calculate average rating and review count
  const reviews = product.reviews || [];
  const reviewCount = reviews.length;
  const averageRating = reviewCount > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
    : 0;

  // Generate SKU from ID
  const sku = `PROD-${String(product.id).padStart(3, '0')}`;

  // Convert price from Decimal to number
  const price = parseFloat(product.price);

  // Create images array (using single image field, can be extended)
  const images = product.image ? [product.image] : [];

  // Format category name (lowercase for slug)
  const categorySlug = product.category?.name?.toLowerCase().replace(/\s+/g, '-') || '';

  return {
    sku,
    name: product.name,
    description: product.description || '',
    price,
    currency: 'USD', // Default currency
    image: product.image || null,
    images,
    category: categorySlug,
    inStock: product.stock > 0,
    stockQuantity: product.stock,
    sizes: Array.isArray(product.sizes) ? product.sizes : [],
    colors: Array.isArray(product.colors) ? product.colors : [],
    specifications: {}, // Not in schema, return empty object
    rating: parseFloat(product.rating), // Round to 1 decimal
    reviewCount,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };
}

export function formatProductWithReviews(product) {
  const baseProduct = formatProduct(product);
  
  // Format reviews
  const reviews = (product.reviews || []).map((review) => ({
    id: `review_${review.id}`,
    userId: `user_${review.user.id}`,
    userName: `${review.user.firstName || ''} ${review.user.lastName || ''}`.trim() || review.user.username,
    userAvatar: review.user.avatar || null,
    rating: review.rating,
    comment: review.comment || '',
    createdAt: review.createdAt.toISOString(),
  }));

  return {
    ...baseProduct,
    reviews,
  };
}

export function formatProductSummary(product) {
  return {
    sku: `PROD-${String(product.id).padStart(3, '0')}`,
    name: product.name,
    price: parseFloat(product.price),
    image: product.image || null,
    category: product.category?.name?.toLowerCase().replace(/\s+/g, '-') || '',
    inStock: product.stock > 0,
  };
}


