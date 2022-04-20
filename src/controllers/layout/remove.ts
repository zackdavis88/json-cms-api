import { Request, Response } from 'express';
import { getUserInfo } from '../utils';

export const remove = async (req: Request, res: Response) => {
  const { requestedLayout, user } = req;

  requestedLayout.isActive = false;
  requestedLayout.deletedOn = new Date();
  requestedLayout.deletedBy = user._id;

  try {
    await requestedLayout.save();
  } catch (removeError) {
    return res.fatalError(removeError);
  }

  const layoutData = {
    layout: {
      id: requestedLayout._id,
      name: requestedLayout.name,
      isActive: requestedLayout.isActive,
      createdOn: requestedLayout.createdOn,
      createdBy: getUserInfo(requestedLayout, 'createdBy'),
      deletedOn: requestedLayout.deletedOn,
      deletedBy: {
        username: user.username,
        displayName: user.displayName,
      },
    },
  };

  return res.success('layout has been successfully removed', layoutData);
};
