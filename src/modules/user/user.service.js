import { UserModel } from './user.model.js';

export const UserService = {
  async getUserById(id) {
    const user = await UserModel.findByIdWithRelations(id);
    if (!user) {
      const err = new Error('User not found');
      err.name = 'NotFoundError';
      err.status = 404;
      throw err;
    }
    // Remove password from response
    const { password: _p, ...safeUser } = user;
    return safeUser;
  },
};

