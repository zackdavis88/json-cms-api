import { Request, Response } from 'express';

export const remove = async (req: Request, res: Response) => {
  const { requestedUser } = req;
  requestedUser.isActive = false;
  requestedUser.deletedOn = new Date();

  try {
    await requestedUser.save();
  } catch (removeError) {
    return res.fatalError(removeError);
  }

  const userData = {
    user: {
      username: requestedUser.username,
      displayName: requestedUser.displayName,
      isActive: requestedUser.isActive,
      createdOn: requestedUser.createdOn,
      updatedOn: requestedUser.updatedOn,
      deletedOn: requestedUser.deletedOn,
    },
  };

  return res.success('user has been successfully removed', userData);
};
