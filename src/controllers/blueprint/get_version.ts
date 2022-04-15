import { Request, Response, NextFunction } from 'express';
import { BlueprintVersion, BlueprintVersionInstance } from '../../models';

export const getVersion = async (req: Request, res: Response, next: NextFunction) => {
  const { query, requestedBlueprint } = req;
  const requestedVersion = Number(query.version);

  if (
    isNaN(requestedVersion) ||
    requestedVersion < 1 ||
    !Number.isInteger(requestedVersion) ||
    requestedVersion >= requestedBlueprint.version
  ) {
    return next();
  }

  const queryArgs = { blueprintId: requestedBlueprint._id, version: requestedVersion };
  let blueprintVersion: BlueprintVersionInstance;
  try {
    blueprintVersion = await BlueprintVersion.findOne(queryArgs).exec();
  } catch (findOneError) {
    return res.fatalError(findOneError);
  }

  if (!blueprintVersion) {
    return next();
  }

  requestedBlueprint.version = requestedVersion;
  requestedBlueprint.fields = blueprintVersion.fields;
  requestedBlueprint.name = blueprintVersion.name;
  next();
};
