import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import { SALT_ROUNDS } from '../../config/auth';

export const generateKey = () => uuid().toString();

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

export const compareHash = (
  password: string,
  hash: string,
  callback: (err: Error, result?: boolean) => void,
) => {
  bcrypt.compare(password, hash, (err, result) => {
    if (err) return callback(err);

    callback(null, result);
  });
};
