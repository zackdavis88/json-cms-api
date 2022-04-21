import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User, UserInstance, compareHash } from '../../models';
import { SECRET } from '../../config/auth';

export const generateToken = async (req: Request, res: Response) => {
  const { credentials } = req;
  const [username, password] = credentials;

  const queryArgs = {
    username: username.toLowerCase(),
    isActive: true,
  };

  let user: UserInstance;
  try {
    user = await User.findOne(queryArgs).exec();
  } catch (findOneError) {
    return res.fatalError(findOneError);
  }

  if (!user) {
    return res.authenticationError('username and password combination is invalid');
  }

  let passwordIsValid: boolean;
  try {
    passwordIsValid = await compareHash(password, user.hash);
  } catch (compareError) {
    return res.fatalError(compareError);
  }

  if (!passwordIsValid) {
    return res.authenticationError('username and password combination is invalid');
  }

  const tokenData = {
    _id: user._id,
    apiKey: user.apiKey,
  };
  const jwtOptions = { expiresIn: '10h' };
  const token = jwt.sign(tokenData, SECRET, jwtOptions);
  const userData = {
    user: {
      username: user.username,
      displayName: user.displayName,
      createdOn: user.createdOn,
      updatedOn: user.updatedOn,
    },
  };

  res.set('x-auth-token', token);
  res.success('user successfully authenticated', userData);
};
