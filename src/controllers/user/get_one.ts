import { Request, Response } from 'express';

export const getOne = (req: Request, res: Response) => {
  const { requestedUser } = req;
  const userData = {
    user: {
      username: requestedUser.username,
      displayName: requestedUser.displayName,
      createdOn: requestedUser.createdOn,
    },
  };

  return res.success('user has been successfully retrieved', userData);
};
