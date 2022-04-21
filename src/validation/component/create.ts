import { Request, Response, NextFunction } from 'express';
import { BlueprintInstance } from '../../models';
import { validateBlueprint, validateContent } from './utils';
import { validateName } from '../utils';

export const create = async (req: Request, res: Response, next: NextFunction) => {
  const { blueprint: blueprintId, name, content } = req.body;

  let componentBlueprint: BlueprintInstance;
  try {
    componentBlueprint = await validateBlueprint(blueprintId);
  } catch (validateBlueprintError) {
    if (typeof validateBlueprintError === 'string') {
      return res.validationError(validateBlueprintError);
    } else {
      return res.fatalError(validateBlueprintError);
    }
  }

  const nameError = await validateName(name);
  if (nameError) {
    return res.validationError(nameError);
  }

  const { error: contentError, sanitizedContent } = await validateContent(
    content,
    componentBlueprint.fields,
  );
  if (contentError) {
    return res.validationError(contentError);
  }

  req.componentBlueprint = componentBlueprint;
  req.sanitizedContent = sanitizedContent;
  next();
};
