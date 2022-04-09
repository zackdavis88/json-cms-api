import { isMissing, compareType, ValidationError } from '../../utils';
import { compareHash } from '../../../models';

type ValidateCurrentPassword = (
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  password: any,
  hash: string,
) => Promise<void | ValidationError>;

export const validateCurrentPassword: ValidateCurrentPassword = (password, hash) =>
  new Promise((resolve) => {
    if (isMissing(password)) {
      return resolve('current password is missing from input');
    }

    if (!compareType(password, 'string')) {
      return resolve('current password must be a string');
    }

    compareHash(password, hash, (err: Error, isValid: boolean) => {
      if (err) {
        return resolve(err);
      }

      if (!isValid) {
        return resolve('current password is invalid');
      }

      resolve();
    });
  });
