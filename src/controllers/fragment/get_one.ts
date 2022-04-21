import { Request, Response } from 'express';
import { getUserInfo } from '../utils';

export const getOne = (req: Request, res: Response) => {
  const { requestedFragment } = req;

  const fragmentData = {
    fragment: {
      name: requestedFragment.name,
      content: requestedFragment.content,
      createdOn: requestedFragment.createdOn,
      updatedOn: requestedFragment.updatedOn,
      createdBy: getUserInfo(requestedFragment, 'createdBy'),
      updatedBy: getUserInfo(requestedFragment, 'updatedBy'),
    },
  };

  return res.success('fragment has been successfully retrieved', fragmentData);
};
