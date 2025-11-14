import { ProductService } from './product.service.js';
import { successResponse } from '../../utils/response.util.js';
import { formatProductWithReviews, formatProductSummary } from './product.util.js';

export const ProductController = {
  async getProducts(req, res, next) {
    try {
      const result = await ProductService.getAllProducts(req.query);
      return successResponse(res, 'Products fetched successfully', result);
    } catch (err) {
      return next(err);
    }
  },

  async getProductBySku(req, res, next) {
    try {
      const { sku } = req.params;
      const { product, relatedProducts } = await ProductService.getProductBySku(sku);
      
      const formattedProduct = formatProductWithReviews(product);
      const formattedRelated = relatedProducts.map(formatProductSummary);

      return successResponse(res, 'Product fetched successfully', {
        ...formattedProduct,
        relatedProducts: formattedRelated,
      });
    } catch (err) {
      return next(err);
    }
  },

  async getProductsByCategory(req, res, next) {
    try {
      const { category } = req.params;
      const result = await ProductService.getProductsByCategory(category, req.query);
      return successResponse(res, 'Products fetched successfully', result);
    } catch (err) {
      return next(err);
    }
  },
};

