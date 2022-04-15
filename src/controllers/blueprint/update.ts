import { Request, Response } from 'express';
import { getUserInfo } from '../utils';
import { BlueprintVersion, BlueprintInstance } from '../../models';

export const update = async (req: Request, res: Response) => {
  const { name } = req.body;
  const { sanitizedFields, requestedBlueprint, user } = req;

  if (sanitizedFields) {
    const newVersion = {
      name: requestedBlueprint.name,
      blueprintId: requestedBlueprint._id,
      version: requestedBlueprint.version,
      fields: requestedBlueprint.fields,
      createdOn: new Date(),
      createdBy: user._id,
    };

    try {
      await BlueprintVersion.create(newVersion);
    } catch (createError) {
      return res.fatalError(createError);
    }

    requestedBlueprint.fields = sanitizedFields;
    requestedBlueprint.version = requestedBlueprint.version + 1;
  }

  if (name) {
    requestedBlueprint.name = name;
  }

  requestedBlueprint.updatedOn = new Date();
  requestedBlueprint.updatedBy = user._id;

  const updatedByData = {
    username: user.username,
    displayName: user.displayName,
  };

  let blueprint: BlueprintInstance;
  try {
    blueprint = await requestedBlueprint.save();
  } catch (updateError) {
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
      version: blueprint.version,
    },
  };

  return res.success('blueprint has been successfully updated', blueprintData);
};
