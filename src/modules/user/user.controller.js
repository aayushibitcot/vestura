import { UserService } from './user.service.js';
import { successResponse } from '../../utils/response.util.js';

export const UserController = {
  async getUserById(req, res, next) {
    try {
      const { id } = req.params;
      const userId = parseInt(id, 10);
      
      if (isNaN(userId)) {
        const err = new Error('Invalid user ID');
        err.name = 'ValidationError';
        err.status = 400;
        throw err;
      }

      const user = await UserService.getUserById(userId);
      return successResponse(res, 'User details fetched successfully', { user });
    } catch (err) {
      return next(err);
    }
  },

  async updateUser(req, res, next) {
    try {
      const { id } = req.params;
      const userId = parseInt(id, 10);
      
      if (isNaN(userId)) {
        const err = new Error('Invalid user ID');
        err.name = 'ValidationError';
        err.status = 400;
        throw err;
      }

      const user = await UserService.updateUser(userId, req.body);
      return successResponse(res, 'User updated successfully', { user });
    } catch (err) {
      return next(err);
    }
  },
};

