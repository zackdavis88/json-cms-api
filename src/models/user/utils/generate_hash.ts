import bcrypt from 'bcryptjs';
import { SALT_ROUNDS } from '../../../config/auth';

type GenerateHash = (password: string) => Promise<string>;
export const generateHash: GenerateHash = (password) =>
  new Promise((resolve) => {
    bcrypt.hash(password, SALT_ROUNDS, (hashError, hash) => {
      if (hashError) {
        throw hashError;
      }

      resolve(hash);
    });
  });
