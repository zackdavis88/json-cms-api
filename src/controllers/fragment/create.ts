import { Request, Response } from 'express';
import { Fragment, FragmentInstance } from '../../models';

export const create = async (req: Request, res: Response) => {
  const { name, content } = req.body;
  const { user } = req;

  const newFragment = {
    name: name.toLowerCase(),
    content,
    isActive: true,
    createdOn: new Date(),
    createdBy: user._id,
  };

  let fragment: FragmentInstance;
  try {
    fragment = await Fragment.create(newFragment);
  } catch (createError) {
    return res.fatalError(createError);
  }

  const fragmentData = {
    fragment: {
      name: fragment.name,
      content: fragment.content,
      createdOn: fragment.createdOn,
      createdBy: {
        username: user.username,
        displayName: user.displayName,
      },
    },
  };

  return res.success('fragment has been successfully created', fragmentData);
};
