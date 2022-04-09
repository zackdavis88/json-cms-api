import { Request, Response } from 'express';

export const remove = (req: Request, res: Response) => {
  const { requestedUser } = req;
  requestedUser.isActive = false;
  requestedUser.deletedOn = new Date();
  requestedUser.save((err, user) => {
    if (err) {
      return res.fatalError(err);
    }

    const userData = {
      user: {
        username: user.username,
        displayName: user.displayName,
        isActive: user.isActive,
        createdOn: user.createdOn,
        updatedOn: user.updatedOn,
        deletedOn: user.deletedOn,
      },
    };

    return res.success('user has been successfully removed', userData);
  });
};
