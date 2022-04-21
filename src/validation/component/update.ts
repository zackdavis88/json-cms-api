import { Request, Response, NextFunction } from 'express';
import { validateContent } from './utils';
import { validateName } from '../utils';

export const update = async (req: Request, res: Response, next: NextFunction) => {
  const { requestedComponent } = req;
  const { name, content } = req.body;

  if (!name && !content) {
    return res.validationError('request contains no update data');
  }

  const isRequired = false;
  const nameError = await validateName(name, isRequired);
  if (nameError) {
    return res.validationError(nameError);
  }

  const { error: contentError, sanitizedContent } = await validateContent(
    content,
    requestedComponent.blueprint.fields,
    isRequired,
  );
  if (contentError) {
    return res.validationError(contentError);
  }

  if (sanitizedContent) {
    req.sanitizedContent = sanitizedContent;
  }

  next();
};
