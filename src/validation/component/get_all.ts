import { Request, Response, NextFunction } from 'express';
import { getPaginationData, QueryString, QueryArgs, escapeRegex } from '../utils';
import { Component } from '../../models';

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  const queryStringInput = req.query;
  const countQueryArgs: QueryArgs = { isActive: true };
  if (queryStringInput.filterName) {
    countQueryArgs.name = {
      $regex: `^${escapeRegex(queryStringInput.filterName.toString())}`,
      $options: 'i',
    };
  }
  const { error, paginationData } = await getPaginationData(
    Component,
    countQueryArgs,
    queryStringInput as QueryString,
  );

  if (error) {
    return res.fatalError(error);
  }

  req.paginationData = paginationData;
  next();
};
