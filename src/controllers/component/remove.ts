import { Request, Response } from 'express';
import { getUserInfo } from '../utils';
import { ComponentVersion } from '../../models';

export const remove = async (req: Request, res: Response) => {
  const { requestedComponent, user } = req;

  requestedComponent.isActive = false;
  requestedComponent.deletedOn = new Date();
  requestedComponent.deletedBy = user._id;

  try {
    const newVersion = {
      name: requestedComponent.name,
      componentId: requestedComponent._id,
      version: requestedComponent.version,
      content: requestedComponent.content,
      createdOn: new Date(),
      createdBy: user._id,
    };
    await ComponentVersion.create(newVersion);
    requestedComponent.version = requestedComponent.version + 1;
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
