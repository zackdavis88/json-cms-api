import { Request, Response, NextFunction } from 'express';
import { validateName, validateFields } from './utils';

export const create = async (req: Request, res: Response, next: NextFunction) => {
  const { name, fields } = req.body;

  const nameError = await validateName(name);
  if (nameError) {
    return res.validationError(nameError);
  }

  const { error: fieldsError, sanitizedFields } = await validateFields(fields);
  if (fieldsError) {
    return res.validationError(fieldsError);
  }

  req.sanitizedFields = sanitizedFields;
  next();
};
