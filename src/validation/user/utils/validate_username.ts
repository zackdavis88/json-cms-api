import { isMissing, compareType, ValidationError } from '../../utils';
import { User, UserInstance } from '../../../models';
import { NativeError } from 'mongoose';

type ValidateUsername = (
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  username: any,
  isRequired?: boolean,
) => Promise<void | ValidationError>;

export const validateUsername: ValidateUsername = (username, isRequired = true) =>
  new Promise((resolve) => {
    if (isRequired && isMissing(username)) {
      return resolve('username is missing from input');
    }

    if (!compareType(username, 'string')) {
      return resolve('username must be a string');
    }

    if (username.length < 3 || username.length > 26) {
      return resolve('username must be 3 - 26 characters in length');
    }

    const regex = new RegExp('^[A-Za-z0-9-_]+$');
    if (!regex.test(username)) {
      return resolve(
        'username may only contain alphanumeric, - (dash), and _ (underscore) characters',
      );
    }

    const queryParams = { username: username.toLowerCase(), isActive: true };
    User.findOne(queryParams, (err: NativeError, user: UserInstance) => {
      if (err) {
        return resolve(err);
      }

      if (user) {
        return resolve('username is already taken');
      }

      resolve();
    });
  });
