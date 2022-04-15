import { isMissing, compareType } from '../../utils';

type ValidateUsername = (
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  name: any,
  isRequired?: boolean,
) => Promise<void | string>;

export const validateName: ValidateUsername = (name, isRequired = true) =>
  new Promise((resolve) => {
    if (isMissing(name) && !isRequired) {
      return resolve();
    } else if (isMissing(name) && isRequired) {
      return resolve('name is missing from input');
    }

    if (!compareType(name, 'string')) {
      return resolve('name must be a string');
    }

    if (name.length < 1 || name.length > 100) {
      return resolve('name must be 1 - 100 characters in length');
    }

    // eslint-disable-next-line quotes
    const regex = new RegExp("^[A-Za-z0-9-_+=&^%$#*@!|(){}?.,<>;': ]+$");
    if (!regex.test(name)) {
      return resolve('name contains invalid characters');
    }

    resolve();
  });
