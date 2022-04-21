import { Request, Response } from 'express';
import { QueryArgs, escapeRegex } from '../../validation';
import { Fragment, FragmentInstance } from '../../models';
import { getUserInfo } from '../utils';

export const getAll = async (req: Request, res: Response) => {
  const { query } = req;
  const { page, totalItems, totalPages, itemsPerPage, pageOffset } = req.paginationData;
  const queryArgs: QueryArgs = { isActive: true };
  if (query.filterName) {
    queryArgs.name = {
      $regex: `^${escapeRegex(query.filterName.toString())}`,
      $options: 'i',
    };
  }

  let fragments: FragmentInstance[];
  try {
    fragments = await Fragment.find(queryArgs)
      .sort({ createdOn: 'asc' })
      .skip(pageOffset)
      .limit(itemsPerPage)
      .exec();
  } catch (findAllError) {
    return res.fatalError(findAllError);
  }

  const fragmentList = {
    page,
    totalPages,
    totalItems,
    itemsPerPage,
    fragments: fragments.map((fragment) => ({
      id: fragment._id,
      name: fragment.name,
      createdOn: fragment.createdOn,
      updatedOn: fragment.updatedOn,
      createdBy: getUserInfo(fragment, 'createdBy'),
      updatedBy: getUserInfo(fragment, 'updatedBy'),
    })),
  };

  return res.success('fragment list has been successfully retrieved', fragmentList);
};
