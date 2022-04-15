import { Request, Response } from 'express';
import { Blueprint, BlueprintTypes, BlueprintInstance } from '../../models';

export const create = async (req: Request, res: Response) => {
  const { name } = req.body;
  const { user, sanitizedFields } = req;

  const newBlueprint: BlueprintTypes = {
    name,
    isActive: true,
    createdOn: new Date(),
    createdBy: user._id,
    fields: sanitizedFields,
    version: 1,
  };

  let blueprint: BlueprintInstance;
  try {
    blueprint = await Blueprint.create(newBlueprint);
  } catch (createError) {
    return res.fatalError(createError);
  }

  const blueprintData = {
    blueprint: {
      id: blueprint._id,
      name: blueprint.name,
      createdOn: blueprint.createdOn,
      createdBy: {
        username: user.username,
        displayName: user.displayName,
      },
      fields: blueprint.fields,
      version: blueprint.version,
    },
  };

  return res.success('blueprint has been successfully created', blueprintData);
};
