import { Request, Response } from 'express';
import { Component, ComponentInstance } from '../../models';

export const create = async (req: Request, res: Response) => {
  const { user, componentBlueprint, sanitizedContent } = req;
  const { name } = req.body;

  const newComponent = {
    name,
    isActive: true,
    blueprint: componentBlueprint._id,
    blueprintVersion: componentBlueprint.version,
    content: sanitizedContent,
    createdOn: new Date(),
    createdBy: user._id,
    version: 1,
  };

  let component: ComponentInstance;
  try {
    component = await Component.create(newComponent);
  } catch (createError) {
    return res.fatalError(createError);
  }

  const componentData = {
    component: {
      id: component._id,
      blueprint: {
        id: componentBlueprint._id,
        version: componentBlueprint.version,
        name: componentBlueprint.name,
      },
      name: component.name,
      version: component.version,
      content: component.content,
      createdOn: component.createdOn,
      createdBy: {
        username: user.username,
        displayName: user.displayName,
      },
    },
  };

  return res.success('component has been successfully created', componentData);
};
