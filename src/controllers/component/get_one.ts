import { Request, Response } from 'express';
import { getUserInfo } from '../utils';

export const getOne = (req: Request, res: Response) => {
  const { requestedComponent } = req;

  const componentData = {
    component: {
      id: requestedComponent._id,
      name: requestedComponent.name,
      blueprint: {
        id: requestedComponent.blueprint._id,
        name: requestedComponent.blueprint.name,
        version: requestedComponent.blueprint.version,
        fields: requestedComponent.blueprint.fields,
      },
      content: requestedComponent.content,
      createdOn: requestedComponent.createdOn,
      updatedOn: requestedComponent.updatedOn,
      createdBy: getUserInfo(requestedComponent, 'createdBy'),
      updatedBy: getUserInfo(requestedComponent, 'updatedBy'),
      version: requestedComponent.version,
    },
  };

  return res.success('component has been successfully retrieved', componentData);
};
