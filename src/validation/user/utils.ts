import { isMissing, compareType, ValidationError } from '../utils';
import { User, UserInstance } from '../../models';
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
