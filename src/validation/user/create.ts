import { Request, Response, NextFunction } from 'express';
import { validateUsername, validatePassword } from './utils';

export const create = async (req: Request, res: Response, next: NextFunction) => {
  const { username, password } = req.body;

  const usernameError = await validateUsername(username);
  if (typeof usernameError === 'string') {
    return res.validationError(usernameError);
  } else if (usernameError) {
    return res.fatalError(usernameError);
  }

  const passwordError = await validatePassword(password);
  if (typeof passwordError === 'string') {
    return res.validationError(passwordError);
  }

  next();
};
