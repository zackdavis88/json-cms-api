import { Request, Response } from 'express';
import { generateHash } from '../../models';

export const update = (req: Request, res: Response) => {
  const { password } = req.body;
  const { requestedUser } = req;
  generateHash(password, (hashError, hash) => {
    if (hashError) {
      return res.fatalError(hashError);
    }

    requestedUser.hash = hash;
    requestedUser.updatedOn = new Date();
    requestedUser.save((saveErr) => {
      if (saveErr) {
        return res.fatalError(saveErr);
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
    });
  });
};
