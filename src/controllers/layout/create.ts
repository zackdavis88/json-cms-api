import { Request, Response } from 'express';
import { ComponentInstance, Layout, LayoutInstance } from '../../models';

export const create = async (req: Request, res: Response) => {
  const { name, components } = req.body;
  const { user, layoutComponents } = req;

  const newLayout = {
    name,
    components,
    isActive: true,
    createdOn: new Date(),
    createdBy: user._id,
  };

  let layout: LayoutInstance;
  try {
    layout = await Layout.create(newLayout);
  } catch (createError) {
    return res.fatalError(createError);
  }

  const componentLayoutMap = layoutComponents.reduce<{
    [key: string]: ComponentInstance;
  }>((prev, component) => {
    return { ...prev, [component._id.toString()]: component };
  }, {});

  const layoutData = {
    layout: {
      id: layout._id,
      name: layout.name,
      createdOn: layout.createdOn,
      createdBy: {
        username: user.username,
        displayName: user.displayName,
      },
      components: layout.components.map((componentId) => {
        const component = componentLayoutMap[componentId.toString()];
        return {
          id: component._id,
          name: component.name,
          version: component.version,
          content: component.content,
        };
      }),
    },
  };

  return res.success('layout has been successfully created', layoutData);
};
