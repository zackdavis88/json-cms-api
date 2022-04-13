import { Request, Response } from 'express';
import { getUserInfo } from '../utils';

export const getOne = (req: Request, res: Response) => {
  const { requestedBlueprint } = req;

  const blueprintData = {
    blueprint: {
      id: requestedBlueprint._id,
      name: requestedBlueprint.name,
      createdOn: requestedBlueprint.createdOn,
      updatedOn: requestedBlueprint.updatedOn,
      createdBy: getUserInfo(requestedBlueprint, 'createdBy'),
      updatedBy: getUserInfo(requestedBlueprint, 'updatedBy'),
      fields: requestedBlueprint.fields,
    },
  };

  return res.success('blueprint has been successfully retrieved', blueprintData);
};
