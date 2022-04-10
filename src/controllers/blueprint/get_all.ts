import { Request, Response } from 'express';
import { QueryArgs, escapeRegex } from '../../validation';
import { Blueprint, UserInstance } from '../../models';
import { getUserInfo } from '../utils';

export const getAll = (req: Request, res: Response) => {
  const { query } = req;
  const { page, totalItems, totalPages, itemsPerPage, pageOffset } = req.paginationData;
  const queryArgs: QueryArgs = { isActive: true };
  if (query.filterName) {
    queryArgs.name = {
      $regex: `^${escapeRegex(query.filterName.toString())}`,
      $options: 'i',
    };
  }

  Blueprint.find(queryArgs)
    .sort({ createdOn: 'asc' })
    .populate<{ createdBy: UserInstance }>('createdBy', '-_id username displayName')
    .populate<{ updatedBy: UserInstance }>('updatedBy', '-_id username displayName')
    .skip(pageOffset)
    .limit(itemsPerPage)
    .exec((err, blueprints) => {
      if (err) {
        return res.fatalError(err);
      }

      const blueprintList = {
        page,
        totalPages,
        totalItems,
        itemsPerPage,
        blueprints: blueprints.map((blueprint) => ({
          id: blueprint._id,
          name: blueprint.name,
          createdOn: blueprint.createdOn,
          updatedOn: blueprint.updatedOn,
          createdBy: getUserInfo(blueprint, 'createdBy'),
          updatedBy: getUserInfo(blueprint, 'updatedBy'),
        })),
      };

      return res.success('blueprint list has been successfully retrieved', blueprintList);
    });
};
