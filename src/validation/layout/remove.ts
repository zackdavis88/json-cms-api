import { Request, Response, NextFunction } from 'express';
import { isMissing, compareType } from '../utils';

export const remove = (req: Request, res: Response, next: NextFunction) => {
  const { confirm } = req.body;
  const expectedLayoutName = req.requestedLayout.name;
  if (isMissing(confirm)) {
    return res.validationError('confirm is missing from input');
  }

  if (!compareType(confirm, 'string')) {
    return res.validationError('confirm must be a string');
  }

  if (confirm !== expectedLayoutName) {
    return res.validationError('confirm input must match the layout name');
  }

  next();
};
