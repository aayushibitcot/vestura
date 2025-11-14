import { prisma } from '../../config/db.js';

export const UserModel = {
  create: (data) => prisma.user.create({ data }),
  findByEmail: (email) => prisma.user.findUnique({ where: { email } }),
  findById: (id) => prisma.user.findUnique({ where: { id } }),
  update: (id, data) => prisma.user.update({ where: { id }, data }),
  findByIdWithRelations: (id) => prisma.user.findUnique({
    where: { id },
    include: {
      addresses: true,
      cart: {
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
        },
      },
      orders: {
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
        orderBy: {
          createdAt: 'desc',
        },
      },
      reviews: {
        include: {
          product: {
            include: {
              category: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
      wishlist: {
        include: {
          product: {
            include: {
              category: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
      payments: {
        include: {
          order: {
            include: {
              items: {
                include: {
                  product: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  }),
};
