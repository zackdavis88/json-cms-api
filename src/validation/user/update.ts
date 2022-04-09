import { Request, Response, NextFunction } from 'express';
import { validateCurrentPassword, validatePassword } from './utils';

export const update = async (req: Request, res: Response, next: NextFunction) => {
  const { password, currentPassword } = req.body;
  const { user } = req;
  const currentPasswordError = await validateCurrentPassword(currentPassword, user.hash);
  if (typeof currentPasswordError === 'string') {
    return res.validationError(currentPasswordError);
  } else if (currentPasswordError) {
    return res.fatalError(currentPasswordError);
  }

  const passwordError = await validatePassword(password);
  if (typeof passwordError === 'string') {
    return res.validationError(passwordError);
  }

  next();
};
