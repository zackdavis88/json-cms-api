import { Request, Response } from 'express';
import { getUserInfo } from '../utils';

export const remove = async (req: Request, res: Response) => {
  const { requestedBlueprint, user } = req;

  requestedBlueprint.isActive = false;
  requestedBlueprint.deletedOn = new Date();
  requestedBlueprint.deletedBy = user._id;

  try {
    await requestedBlueprint.save();
  } catch (removeError) {
    return res.fatalError(removeError);
  }

  /* Thinking I will avoid returning version/fields here on purpose. It could lead to confusion
     like the user thinking that one specific version was removed when in-fact this removes the
     Blueprint AND previous versions of it.
  */
  const blueprintData = {
    blueprint: {
      id: requestedBlueprint.id,
      isActive: requestedBlueprint.isActive,
      name: requestedBlueprint.name,
      createdOn: requestedBlueprint.createdOn,
      createdBy: getUserInfo(requestedBlueprint, 'createdBy'),
      deletedOn: requestedBlueprint.deletedOn,
      deletedBy: {
        username: user.username,
        displayName: user.displayName,
      },
    },
  };

  return res.success('blueprint has been successfully removed', blueprintData);
};
