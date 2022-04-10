import { Request, Response } from 'express';
import { Blueprint, BlueprintTypes } from '../../models';

export const create = (req: Request, res: Response) => {
  const { name } = req.body;
  const { user, sanitizedFields } = req;

  const newBlueprint: BlueprintTypes = {
    name,
    isActive: true,
    createdOn: new Date(),
    createdBy: user._id,
    fields: sanitizedFields,
  };
  Blueprint.create(newBlueprint, (createError, blueprint) => {
    if (createError) {
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
      },
    };

    return res.success('blueprint has been successfully created', blueprintData);
  });
};
