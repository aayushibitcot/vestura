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

  async updateUser(id, updateData) {
    // Check if user exists
    const existingUser = await UserModel.findById(id);
    if (!existingUser) {
      const err = new Error('User not found');
      err.name = 'NotFoundError';
      err.status = 404;
      throw err;
    }

    // Prepare update data - only include fields that are provided
    const dataToUpdate = {};
    if (updateData.firstName !== undefined) dataToUpdate.firstName = updateData.firstName;
    if (updateData.lastName !== undefined) dataToUpdate.lastName = updateData.lastName;
    if (updateData.phone !== undefined) dataToUpdate.phone = updateData.phone;
    if (updateData.avatar !== undefined) dataToUpdate.avatar = updateData.avatar;

    // Update user
    const updatedUser = await UserModel.update(id, dataToUpdate);
    
    // Remove password from response
    const { password: _p, ...safeUser } = updatedUser;
    return safeUser;
  },
};

