import { Request, Response } from 'express';
import { generateHash } from '../../models';

export const update = async (req: Request, res: Response) => {
  const { password } = req.body;
  const { requestedUser } = req;

  let hash: string;
  try {
    hash = await generateHash(password);
  } catch (hashError) {
    return res.fatalError(hashError);
  }

  requestedUser.hash = hash;
  requestedUser.updatedOn = new Date();

  try {
    await requestedUser.save();
  } catch (updateError) {
    return res.fatalError(updateError);
  }

  const userData = {
    user: {
      username: requestedUser.username,
      displayName: requestedUser.displayName,
      createdOn: requestedUser.createdOn,
      updatedOn: requestedUser.updatedOn,
    },
  };

  res.success('user password has been successfully updated', userData);
};
