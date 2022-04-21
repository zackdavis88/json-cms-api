import { Request, Response, NextFunction } from 'express';
import { ComponentInstance } from '../../models';
import { validateName } from '../utils';
import { validateComponents } from './utils';

export const create = async (req: Request, res: Response, next: NextFunction) => {
  const { name, components } = req.body;

  const nameError = await validateName(name);
  if (nameError) {
    return res.validationError(nameError);
  }

  let componentList: ComponentInstance[] = [];
  try {
    const result = await validateComponents(components);
    if (result) {
      componentList = result;
    }
  } catch (componentsError) {
    if (typeof componentsError === 'string') {
      return res.validationError(componentsError);
    } else {
      return res.fatalError(componentsError);
    }
  }

  req.layoutComponents = componentList;
  next();
};
