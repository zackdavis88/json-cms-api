import { Request, Response } from 'express';
import { QueryArgs, escapeRegex, PopulatedComponentInstance } from '../../validation';
import { Component, BlueprintInstance, UserInstance } from '../../models';
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

  let components: PopulatedComponentInstance[];
  try {
    components = await Component.find(queryArgs)
      .sort({ createdOn: 'asc' })
      .populate<{ blueprint: BlueprintInstance }>('blueprint')
      .populate<{ createdBy: UserInstance }>('createdBy', '-_id username displayName')
      .populate<{ updatedBy: UserInstance }>('updatedBy', '-_id username displayName')
      .skip(pageOffset)
      .limit(itemsPerPage)
      .exec();
  } catch (findAllError) {
    return res.fatalError(findAllError);
  }

  const componentList = {
    page,
    totalPages,
    totalItems,
    itemsPerPage,
    components: components.map((component) => ({
      id: component._id,
      name: component.name,
      blueprint: {
        id: component.blueprint._id,
        name: component.blueprint.name,
        version: component.blueprintVersion,
      },
      createdOn: component.createdOn,
      updatedOn: component.updatedOn,
      createdBy: getUserInfo(component, 'createdBy'),
      updatedBy: getUserInfo(component, 'updatedBy'),
    })),
  };

  return res.success('component list has been successfully retrieved', componentList);
};
