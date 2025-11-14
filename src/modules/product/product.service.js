import { ProductModel } from './product.model.js';
import { formatProduct } from './product.util.js';
import { prisma } from '../../config/db.js';

export const ProductService = {
  async getAllProducts(query = {}) {
    const {
      page = 1,
      limit = 20,
      category,
      minPrice,
      maxPrice,
      inStock,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);
    const skip = (pageNumber - 1) * pageSize;

    // Build where clause
    const where = {};
    
    // Category filter (by name)
    if (category) {
      where.category = {
        name: {
          equals: category,
          mode: 'insensitive',
        },
      };
    }

    // Price filters
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) {
        where.price.gte = parseFloat(minPrice);
      }
      if (maxPrice !== undefined) {
        where.price.lte = parseFloat(maxPrice);
      }
    }

    // Stock filter
    if (inStock !== undefined) {
      const inStockBool = inStock === 'true' || inStock === true;
      if (inStockBool) {
        where.stock = { gt: 0 };
      } else {
        where.stock = { lte: 0 };
      }
    }

    // Build orderBy clause
    const orderBy = {};
    const validSortFields = ['price', 'name', 'createdAt'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    orderBy[sortField] = sortOrder.toLowerCase() === 'asc' ? 'asc' : 'desc';

    // Get products and total count
    const [products, total] = await Promise.all([
      ProductModel.findAll({
        where,
        orderBy,
        skip,
        take: pageSize,
      }),
      ProductModel.count(where),
    ]);

    // Format products according to spec
    const formattedProducts = products.map(formatProduct);

    return {
      products: formattedProducts,
      pagination: {
        page: pageNumber,
        limit: pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  },

  async getProductBySku(sku) {
    // Extract ID from SKU format PROD-001
    const idMatch = sku.match(/^PROD-(\d+)$/);
    if (!idMatch) {
      const err = new Error('Invalid SKU format');
      err.name = 'ValidationError';
      err.status = 400;
      throw err;
    }

    const id = parseInt(idMatch[1], 10);
    const product = await ProductModel.findById(id);

    if (!product) {
      const err = new Error('Product not found');
      err.name = 'PRODUCT_NOT_FOUND';
      err.status = 404;
      throw err;
    }

    // Get related products (same category, excluding current)
    const relatedProducts = await ProductModel.findAll({
      where: {
        categoryId: product.categoryId,
        id: { not: id },
      },
      orderBy: { createdAt: 'desc' },
      skip: 0,
      take: 4,
    });

    return {
      product,
      relatedProducts,
    };
  },

  async getProductsByCategory(categoryName, query = {}) {
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);
    const skip = (pageNumber - 1) * pageSize;

    // Build orderBy clause
    const orderBy = {};
    const validSortFields = ['price', 'name', 'createdAt'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    orderBy[sortField] = sortOrder.toLowerCase() === 'asc' ? 'asc' : 'desc';

    // Get category info
    const category = await prisma.category.findFirst({
      where: {
        name: {
          equals: categoryName,
          mode: 'insensitive',
        },
      },
    });

    if (!category) {
      const err = new Error('Category not found');
      err.name = 'NotFoundError';
      err.status = 404;
      throw err;
    }

    // Get products and total count
    const where = {};
    const [products, total] = await Promise.all([
      ProductModel.findByCategoryName(categoryName, {
        where,
        orderBy,
        skip,
        take: pageSize,
      }),
      ProductModel.countByCategoryName(categoryName, where),
    ]);

    // Format products
    const formattedProducts = products.map(formatProduct);

    return {
      products: formattedProducts,
      pagination: {
        page: pageNumber,
        limit: pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
      category: {
        id: `cat_${category.id}`,
        name: category.name,
        slug: category.name.toLowerCase().replace(/\s+/g, '-'),
        description: category.description || '',
        image: category.image || null,
      },
    };
  },
};

