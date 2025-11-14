import { prisma } from '../../config/db.js';

export const ProductModel = {
  findAll: (options = {}) => {
    const { where = {}, include = {}, orderBy = { createdAt: 'desc' }, skip, take } = options;
    
    return prisma.product.findMany({
      where: {
        ...where,
        isActive: where.isActive !== undefined ? where.isActive : true,
      },
      include: {
        category: true,
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
                username: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        ...include,
      },
      orderBy,
      skip,
      take,
    });
  },

  findById: (id) => prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      reviews: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
              username: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  }),

  findByCategoryName: (categoryName, options = {}) => {
    const { where = {}, include = {}, orderBy = { createdAt: 'desc' }, skip, take } = options;
    
    return prisma.product.findMany({
      where: {
        ...where,
        isActive: where.isActive !== undefined ? where.isActive : true,
        category: {
          name: {
            equals: categoryName,
            mode: 'insensitive',
          },
        },
      },
      include: {
        category: true,
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
                username: true,
              },
            },
          },
        },
        ...include,
      },
      orderBy,
      skip,
      take,
    });
  },

  count: (where = {}) => prisma.product.count({
    where: {
      ...where,
      isActive: where.isActive !== undefined ? where.isActive : true,
    },
  }),

  countByCategoryName: (categoryName, where = {}) => prisma.product.count({
    where: {
      ...where,
      isActive: where.isActive !== undefined ? where.isActive : true,
      category: {
        name: {
          equals: categoryName,
          mode: 'insensitive',
        },
      },
    },
  }),

  // Update product rating based on reviews
  updateRating: async (productId) => {
    // Get all reviews for the product
    const reviews = await prisma.review.findMany({
      where: { productId },
      select: { rating: true },
    });

    // Calculate average rating
    const reviewCount = reviews.length;
    const averageRating = reviewCount > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
      : 0;

    // Round to 1 decimal place and convert to string
    const ratingString = averageRating > 0 ? (Math.round(averageRating * 10) / 10).toString() : null;

    // Update product rating
    await prisma.product.update({
      where: { id: productId },
      data: { rating: ratingString },
    });

    return ratingString;
  },
};

