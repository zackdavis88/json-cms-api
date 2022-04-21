import { Request, Response, NextFunction } from 'express';
import { validateFields } from './utils';
import { validateName } from '../utils';

export const update = async (req: Request, res: Response, next: NextFunction) => {
  const { name, fields } = req.body;

  if (!name && !fields) {
    return res.validationError('request contains no update data');
  }

  const isRequired = true;
  const nameError = await validateName(name, !isRequired);
  if (nameError) {
    return res.validationError(nameError);
  }

  const { error: fieldsError, sanitizedFields } = await validateFields(
    fields,
    !isRequired,
  );
  if (fieldsError) {
    return res.validationError(fieldsError);
  }

  if (sanitizedFields) {
    req.sanitizedFields = sanitizedFields;
  }

  next();
};
