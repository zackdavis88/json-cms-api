import {
  ValidationError,
  ModelInstanceTypes,
  ModelTypes,
  QueryArgs,
  Options,
} from './types';

interface GetModelInstanceOutput {
  error?: ValidationError;
  modelInstance?: ModelInstanceTypes;
}

type GetModelInstance = (
  model: ModelTypes,
  queryArgs: QueryArgs,
  errorMessage: string,
  options?: Options,
) => Promise<GetModelInstanceOutput>;

export const getModelInstance: GetModelInstance = (
  model,
  queryArgs,
  errorMessage,
  options,
) =>
  new Promise((resolve) => {
    const dbQuery = model.findOne(queryArgs);
    if (options && options.populate) {
      for (const key in options.populate) {
        if (key) dbQuery.populate(key, options.populate[key]);
      }
    }
    dbQuery.exec((error, modelInstance) => {
      if (error) return resolve({ error });

      if (!modelInstance) return resolve({ error: errorMessage });

      resolve({ modelInstance });
    });
  });
