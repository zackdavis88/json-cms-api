import { Request, Response, NextFunction } from 'express';
import { validateName } from '../utils';
import { Fragment, FragmentInstance } from '../../models';

export const create = async (req: Request, res: Response, next: NextFunction) => {
  const { name } = req.body;

  const nameError = await validateName(name);
  if (nameError) {
    return res.validationError(nameError);
  }

  let fragment: FragmentInstance;
  try {
    fragment = await Fragment.findOne({
      name: name.toLowerCase(),
      isActive: true,
    }).exec();
  } catch (findExistingFragmentError) {
    return res.fatalError(findExistingFragmentError);
  }

  if (fragment) {
    return res.validationError('fragment name is already taken');
  }

  next();
};
