import bcrypt from 'bcryptjs';

type CompareHash = (password: string, hash: string) => Promise<boolean>;
export const compareHash: CompareHash = (password, hash) =>
  new Promise((resolve) => {
    bcrypt.compare(password, hash, (compareError, passwordIsValid) => {
      if (compareError) {
        throw compareError;
      }

      resolve(passwordIsValid);
    });
  });
