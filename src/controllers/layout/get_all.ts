import { Request, Response } from 'express';
import { QueryArgs, escapeRegex, PopulatedLayoutInstance } from '../../validation';
import { Layout, UserInstance } from '../../models';
import { getUserInfo } from '../utils';
import mongoose from 'mongoose';

interface LayoutWithoutComponents extends Omit<PopulatedLayoutInstance, 'components'> {
  components: mongoose.Types.ObjectId[];
}

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

  let layouts: LayoutWithoutComponents[];
  try {
    layouts = await Layout.find(queryArgs)
      .sort({ createdOn: 'asc' })
      .populate<{ createdBy: UserInstance }>('createdBy', '-_id username displayName')
      .populate<{ updatedBy: UserInstance }>('updatedBy', '-_id username displayName')
      .skip(pageOffset)
      .limit(itemsPerPage)
      .exec();
  } catch (findAllError) {
    return res.fatalError(findAllError);
  }

  const layoutList = {
    page,
    totalPages,
    totalItems,
    itemsPerPage,
    layouts: layouts.map((layout) => ({
      id: layout._id,
      name: layout.name,
      createdOn: layout.createdOn,
      updatedOn: layout.updatedOn,
      createdBy: getUserInfo(layout, 'createdBy'),
      updatedBy: getUserInfo(layout, 'updatedBy'),
    })),
  };

  return res.success('layout list has been successfully retrieved', layoutList);
};
