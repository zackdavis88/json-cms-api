import { Request, Response } from 'express';
import { getUserInfo } from '../utils';

export const getOne = (req: Request, res: Response) => {
  const { requestedLayout } = req;

  const layoutData = {
    layout: {
      id: requestedLayout._id,
      name: requestedLayout.name,
      components: requestedLayout.components.map((component) => ({
        id: component._id,
        name: component.name,
        version: component.version,
        content: component.content,
      })),
      createdOn: requestedLayout.createdOn,
      updatedOn: requestedLayout.updatedOn,
      createdBy: getUserInfo(requestedLayout, 'createdBy'),
      updatedBy: getUserInfo(requestedLayout, 'updatedBy'),
    },
  };

  return res.success('layout has been successfully retrieved', layoutData);
};
