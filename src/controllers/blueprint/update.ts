import { Request, Response } from 'express';
import { getUserInfo } from '../utils';
export const update = (req: Request, res: Response) => {
  const { name } = req.body;
  const { sanitizedFields, requestedBlueprint, user } = req;

  if (name) {
    requestedBlueprint.name = name;
  }

  if (sanitizedFields) {
    requestedBlueprint.fields = sanitizedFields;
  }

  requestedBlueprint.updatedOn = new Date();
  requestedBlueprint.updatedBy = user._id;

  const updatedByData = {
    username: user.username,
    displayName: user.displayName,
  };

  requestedBlueprint.save((updateError, blueprint) => {
    if (updateError) {
      return res.fatalError(updateError);
    }

    const blueprintData = {
      blueprint: {
        id: blueprint._id,
        name: blueprint.name,
        createdOn: blueprint.createdOn,
        updatedOn: blueprint.updatedOn,
        createdBy: getUserInfo(requestedBlueprint, 'createdBy'),
        updatedBy: updatedByData,
        fields: blueprint.fields,
      },
    };

    return res.success('blueprint has been successfully updated', blueprintData);
  });
};
