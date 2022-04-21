import { Request, Response, NextFunction } from 'express';
import { ComponentVersion, ComponentVersionInstance } from '../../models';

export const getVersion = async (req: Request, res: Response, next: NextFunction) => {
  const { query, requestedComponent } = req;
  const requestedVersion = Number(query.version);

  if (
    isNaN(requestedVersion) ||
    requestedVersion < 1 ||
    !Number.isInteger(requestedVersion) ||
    requestedVersion >= requestedComponent.version
  ) {
    return next();
  }

  const queryArgs = { componentId: requestedComponent._id, version: requestedVersion };
  let componentVersion: ComponentVersionInstance;
  try {
    componentVersion = await ComponentVersion.findOne(queryArgs).exec();
  } catch (findOneError) {
    return res.fatalError(findOneError);
  }

  if (!componentVersion) {
    return next();
  }

  requestedComponent.version = requestedVersion;
  requestedComponent.content = componentVersion.content;
  requestedComponent.name = componentVersion.name;
  next();
};
