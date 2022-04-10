import { Request, Response } from 'express';
import { User, generateKey, generateHash, UserTypes } from '../../models';

export const create = (req: Request, res: Response) => {
  const { username, password } = req.body;
  generateHash(password, (hashErr, hash) => {
    if (hashErr) {
      return res.fatalError(hashErr);
    }

    const newUser: UserTypes = {
      username: username.toLowerCase(),
      displayName: username,
      hash,
      apiKey: generateKey(),
      isActive: true,
      createdOn: new Date(),
    };

    User.create(newUser, (createErr, user) => {
      if (createErr) {
        return res.fatalError(createErr);
      }

      const userData = {
        user: {
          displayName: user.displayName,
          username: user.username,
          createdOn: user.createdOn,
        },
      };

      res.success('user has been successfully created', userData);
    });
  });
};
