import { Request, Response, NextFunction } from 'express';
import { BlueprintVersion, BlueprintVersionInstance } from '../../models';

export const getBlueprintVersion = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { requestedComponent } = req;
  const blueprint = requestedComponent.blueprint;
  const version = requestedComponent.blueprintVersion || blueprint.version;

  /* Skip querying the DB if the version >= blueprint.version. In this case we will use the latest version
     of blueprint which is already stored in requestedComponent.blueprint
  */
  if (version >= blueprint.version) {
    return next();
  }

  const queryArgs = { blueprintId: blueprint._id, version: version };
  let blueprintVersion: BlueprintVersionInstance;
  try {
    blueprintVersion = await BlueprintVersion.findOne(queryArgs).exec();
  } catch (findOneError) {
    return res.fatalError(findOneError);
  }

  /*
    If we cant find the proper blueprint version for the component then we are in trouble. Ideally this wont happen
    unless someone manually deletes DB records. I think we should explicitly reject requests when we cant find a
    component's blueprint because we wont be able to validate update data without it.
  */
  if (!blueprintVersion) {
    return res.validationError('blueprint version was not found');
  }

  requestedComponent.blueprint.version = version;
  requestedComponent.blueprint.fields = blueprintVersion.fields;
  requestedComponent.blueprint.name = blueprintVersion.name;
  next();
};
