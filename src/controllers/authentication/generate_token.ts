import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User, UserInstance, compareHash } from '../../models';
import { SECRET } from '../../config/auth';

export const generateToken = (req: Request, res: Response) => {
  const { credentials } = req;
  const username = credentials[0];
  const password = credentials[1];

  const queryArgs = {
    username: username.toLowerCase(),
    isActive: true,
  };
  User.findOne(queryArgs, (queryErr: Error, user: UserInstance) => {
    if (queryErr) {
      return res.fatalError(queryErr);
    }

    if (!user)
      return res.authenticationError('username and password combination is invalid');

    compareHash(password, user.hash, (compareErr, passwordIsValid) => {
      if (compareErr) {
        return res.fatalError(compareErr);
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
    });
  });
};
