import { CategoryService } from './category.service.js';
import { successResponse } from '../../utils/response.util.js';

export const CategoryController = {
  async getCategories(req, res, next) {
    try {
      const categories = await CategoryService.getAllCategories();
      return successResponse(res, 'Categories fetched successfully', categories);
    } catch (err) {
      return next(err);
    }
  },
};


