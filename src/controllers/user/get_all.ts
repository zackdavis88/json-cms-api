import { Request, Response } from 'express';
import { User, UserInstance } from '../../models';

export const getAll = async (req: Request, res: Response) => {
  const { paginationData } = req;
  const { totalItems, page, totalPages, itemsPerPage, pageOffset } = paginationData;

  let users: UserInstance[];
  try {
    users = await User.find({ isActive: true })
      .sort({ createdOn: 'asc' })
      .skip(pageOffset)
      .limit(itemsPerPage)
      .exec();
  } catch (findAllError) {
    return res.fatalError(findAllError);
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
};
