import { Request, Response } from 'express';
import { getUserInfo } from '../utils';

export const remove = async (req: Request, res: Response) => {
  const { requestedComponent, user } = req;

  requestedComponent.isActive = false;
  requestedComponent.deletedOn = new Date();
  requestedComponent.deletedBy = user._id;

  try {
    await requestedComponent.save();
  } catch (removeError) {
    return res.fatalError(removeError);
  }

  const componentData = {
    component: {
      id: requestedComponent._id,
      name: requestedComponent.name,
      isActive: requestedComponent.isActive,
      createdOn: requestedComponent.createdOn,
      createdBy: getUserInfo(requestedComponent, 'createdBy'),
      deletedOn: requestedComponent.deletedOn,
      deletedBy: {
        username: user.username,
        displayName: user.displayName,
      },
    },
  };

  return res.success('component has been successfully removed', componentData);
};
