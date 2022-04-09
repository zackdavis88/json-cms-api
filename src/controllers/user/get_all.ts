import { Request, Response } from 'express';
import { User } from '../../models';

export const getAll = (req: Request, res: Response) => {
  const { paginationData } = req;
  const { totalItems, page, totalPages, itemsPerPage, pageOffset } = paginationData;
  User.find({ isActive: true })
    .sort({ createdOn: 'asc' })
    .skip(pageOffset)
    .limit(itemsPerPage)
    .exec((err, users) => {
      if (err) {
        return res.fatalError(err);
      }

      const userList = {
        page,
        totalItems,
        totalPages,
        itemsPerPage,
        users: users.map((userData) => ({
          username: userData.username,
          displayName: userData.displayName,
          createdOn: userData.createdOn,
        })),
      };

      return res.success('user list has been successfully retrieved', userList);
    });
};
