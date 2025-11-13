import bcrypt from 'bcrypt';
import { UserModel } from '../user/user.model.js';

const SALT_ROUNDS = 10;

export const AuthService = {
  async signup({ username, email, password, firstName, lastName, phone, avatar }) {
    const existing = await UserModel.findByEmail(email);
    if (existing) {
      const err = new Error('User already exists');
      err.name = 'ConflictError';
      err.status = 409;
      throw err;
    }
    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await UserModel.create({ username, email, password: hashed, firstName, lastName, phone, avatar });
    const { password: _p, ...safeUser } = user;
    return safeUser;
  },

  async signin({ email, password }) {
    const user = await UserModel.findByEmail(email);
    if (!user) {
      const err = new Error('Invalid email or password');
      err.name = 'AuthError';
      err.status = 401;
      throw err;
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      const err = new Error('Invalid email or password');
      err.name = 'AuthError';
      err.status = 401;
      throw err;
    }
    const { password: _p, ...safeUser } = user;
    return safeUser;
  },
};
