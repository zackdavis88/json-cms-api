import { isMissing, compareType, ValidationError } from '../../utils';

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
type ValidatePassword = (password: any) => Promise<void | ValidationError>;

export const validatePassword: ValidatePassword = (password) =>
  new Promise((resolve) => {
    if (isMissing(password)) {
      return resolve('password is missing from input');
    }

    if (!compareType(password, 'string')) {
      return resolve('password must be a string');
    }

    if (password.length < 8) {
      return resolve('password must be at least 8 characters in length');
    }

    const regex = new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$');
    if (!regex.test(password)) {
      return resolve('password must have 1 uppercase, lowercase, and number character');
    }

    resolve();
  });
