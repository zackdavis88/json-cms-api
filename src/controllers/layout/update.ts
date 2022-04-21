import { Request, Response } from 'express';
import { ComponentInstance } from '../../models';
import { getUserInfo } from '../utils';

export const update = async (req: Request, res: Response) => {
  const { name, components } = req.body;
  const { user, requestedLayout, layoutComponents } = req;

  if (name) {
    requestedLayout.name = name;
  }

  if (components) {
    requestedLayout.components = components;
  }

  requestedLayout.updatedOn = new Date();
  requestedLayout.updatedBy = user._id;

  const componentLayoutMap = (layoutComponents || requestedLayout.components).reduce<{
    [key: string]: ComponentInstance;
  }>((prev, component) => {
    return { ...prev, [component._id.toString()]: component };
  }, {});

  const layoutData = {
    layout: {
      id: requestedLayout._id,
      name: requestedLayout.name,
      createdOn: requestedLayout.createdOn,
      updatedOn: requestedLayout.updatedOn,
      createdBy: getUserInfo(requestedLayout, 'createdBy'),
      updatedBy: {
        username: user.username,
        displayName: user.displayName,
      },
      components: requestedLayout.components.map((componentInstance) => {
        const component = componentLayoutMap[componentInstance._id.toString()];
        return {
          id: component._id,
          name: component.name,
          version: component.version,
          content: component.content,
        };
      }),
    },
  };

  return res.success('layout has been successfully updated', layoutData);
};
