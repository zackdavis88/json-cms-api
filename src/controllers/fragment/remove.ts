import { Request, Response } from 'express';
import { getUserInfo } from '../utils';

export const remove = async (req: Request, res: Response) => {
  const { requestedFragment, user } = req;

  requestedFragment.isActive = false;
  requestedFragment.deletedOn = new Date();
  requestedFragment.deletedBy = user._id;

  try {
    await requestedFragment.save();
  } catch (removeError) {
    return res.fatalError(removeError);
  }

  const fragmentData = {
    fragment: {
      id: requestedFragment._id,
      name: requestedFragment.name,
      isActive: requestedFragment.isActive,
      createdOn: requestedFragment.createdOn,
      createdBy: getUserInfo(requestedFragment, 'createdBy'),
      deletedOn: requestedFragment.deletedOn,
      deletedBy: {
        username: user.username,
        displayName: user.displayName,
      },
    },
  };

  return res.success('fragment has been successfully removed', fragmentData);
};
