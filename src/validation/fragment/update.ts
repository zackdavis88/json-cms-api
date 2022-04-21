import { Request, Response, NextFunction } from 'express';
import { validateName } from '../utils';
import { Fragment, FragmentInstance } from '../../models';

export const update = async (req: Request, res: Response, next: NextFunction) => {
  const { name, content } = req.body;

  if (!name && !content) {
    return res.validationError('request contains no update data');
  }

  const nameError = await validateName(name);
  if (nameError) {
    return res.validationError(nameError);
  }

  let fragment: FragmentInstance;
  try {
    fragment = await Fragment.findOne({ name: name, isActive: true }).exec();
  } catch (findExistingFragmentError) {
    return res.fatalError(findExistingFragmentError);
  }

  if (fragment) {
    return res.validationError('fragment name is already taken');
  }

  next();
};
