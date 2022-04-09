import bcrypt from 'bcryptjs';

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
