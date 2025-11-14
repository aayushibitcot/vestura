import { prisma } from '../../config/db.js';

export const OrderModel = {
  create: (orderData) => prisma.order.create({
    data: orderData,
    include: {
      items: {
        include: {
          product: {
            include: {
              category: true,
            },
          },
        },
      },
      payment: true,
      tracking: true,
    },
  }),

  findByUserId: (userId, options = {}) => {
    const { where = {}, orderBy = { createdAt: 'desc' }, skip, take } = options;
    
    return prisma.order.findMany({
      where: {
        userId,
        ...where,
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                image: true,
                price: true,
              },
            },
          },
        },
        payment: true,
      },
      orderBy,
      skip,
      take,
    });
  },

  countByUserId: (userId, where = {}) => prisma.order.count({
    where: {
      userId,
      ...where,
    },
  }),

  findById: (id) => prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: {
            include: {
              category: true,
            },
          },
        },
      },
      payment: true,
      tracking: true,
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  }),

  findByOrderNumber: (orderNumber) => prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: {
        include: {
          product: {
            include: {
              category: true,
            },
          },
        },
      },
      payment: true,
      tracking: true,
    },
  }),

  update: (id, data) => prisma.order.update({
    where: { id },
    data,
    include: {
      items: {
        include: {
          product: {
            include: {
              category: true,
            },
          },
        },
      },
      payment: true,
      tracking: true,
    },
  }),

  generateOrderNumber: async () => {
    const year = new Date().getFullYear();
    const count = await prisma.order.count({
      where: {
        orderNumber: {
          startsWith: `ORD-${year}-`,
        },
      },
    });
    return `ORD-${year}-${String(count + 1).padStart(3, '0')}`;
  },
};

