import bcrypt from 'bcryptjs';
import { SALT_ROUNDS } from '../../../config/auth';

export const generateHash = (
  password: string,
  callback: (err: Error, hash?: string) => void,
) => {
  bcrypt.genSalt(Number(SALT_ROUNDS) || 10, (saltErr, salt) => {
    if (saltErr) return callback(saltErr);

    bcrypt.hash(password, salt, (hashErr, hash) => {
      if (hashErr) return callback(hashErr);

      callback(null, hash);
    });
  });
};
