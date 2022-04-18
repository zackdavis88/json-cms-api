import { Request, Response } from 'express';
import { ComponentInstance, ComponentVersion } from '../../models';
import { getUserInfo } from '../utils';

export const update = async (req: Request, res: Response) => {
  const { name } = req.body;
  const { user, requestedComponent, sanitizedContent } = req;

  if (name) {
    requestedComponent.name = name;
  }

  if (sanitizedContent) {
    const newVersion = {
      name: requestedComponent.name,
      componentId: requestedComponent._id,
      version: requestedComponent.version,
      content: requestedComponent.content,
      createdOn: new Date(),
      createdBy: user._id,
    };

    try {
      await ComponentVersion.create(newVersion);
    } catch (createError) {
      return res.fatalError(createError);
    }

    requestedComponent.content = sanitizedContent;
    requestedComponent.markModified('content'); // required when updating mongoose Mixed schema items.
    requestedComponent.version = requestedComponent.version + 1;
  }

  requestedComponent.updatedOn = new Date();
  requestedComponent.updatedBy = user._id;

  let component: ComponentInstance;
  try {
    component = await requestedComponent.save();
  } catch (updateError) {
    return res.fatalError(updateError);
  }

  const componentData = {
    component: {
      id: component._id,
      name: component.name,
      version: component.version,
      blueprint: {
        id: requestedComponent.blueprint._id,
        name: requestedComponent.blueprint.name,
        version: requestedComponent.blueprint.version,
      },
      content: component.content,
      createdOn: component.createdOn,
      updatedOn: component.updatedOn,
      createdBy: getUserInfo(requestedComponent, 'createdBy'),
      updatedBy: {
        username: user.username,
        displayName: user.displayName,
      },
    },
  };

  return res.success('component has been successfully updated', componentData);
};
