import { Request, Response } from 'express';
import { getUserInfo } from '../utils';

export const update = async (req: Request, res: Response) => {
  const { name, content } = req.body;
  const { user, requestedFragment } = req;

  if (name) {
    requestedFragment.name = name.toLowerCase();
  }

  if (content) {
    requestedFragment.content = content;
  }

  requestedFragment.updatedOn = new Date();
  requestedFragment.updatedBy = user._id;

  try {
    await requestedFragment.save();
  } catch (updateError) {
    return res.fatalError(updateError);
  }

  const fragmentData = {
    fragment: {
      name: requestedFragment.name,
      content: requestedFragment.content,
      createdOn: requestedFragment.createdOn,
      createdBy: getUserInfo(requestedFragment, 'createdBy'),
      updatedOn: requestedFragment.updatedOn,
      updatedBy: {
        username: user.username,
        displayName: user.displayName,
      },
    },
  };

  return res.success('fragment has been successfully updated', fragmentData);
};
