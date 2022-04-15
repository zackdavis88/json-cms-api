import { Request, Response } from 'express';
import { User, generateKey, generateHash, UserTypes, UserInstance } from '../../models';

export const create = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  let hash: string;
  try {
    hash = await generateHash(password);
  } catch (hashError) {
    return res.fatalError(hashError);
  }

  const newUser: UserTypes = {
    username: username.toLowerCase(),
    displayName: username,
    hash,
    apiKey: generateKey(),
    isActive: true,
    createdOn: new Date(),
  };

  let user: UserInstance;
  try {
    user = await User.create(newUser);
  } catch (createError) {
    return res.fatalError(createError);
  }

  const userData = {
    user: {
      displayName: user.displayName,
      username: user.username,
      createdOn: user.createdOn,
    },
  };

  res.success('user has been successfully created', userData);
};
