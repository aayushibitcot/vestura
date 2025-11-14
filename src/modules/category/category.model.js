import { prisma } from '../../config/db.js';

export const CategoryModel = {
  findAll: () => prisma.category.findMany({
    orderBy: {
      name: 'asc',
    },
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
  }),

  findByName: (name) => prisma.category.findFirst({
    where: {
      name: {
        equals: name,
        mode: 'insensitive',
      },
    },
  }),
};


