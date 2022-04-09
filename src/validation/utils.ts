import { NativeError } from 'mongoose';
import { User, UserInstance } from '../models';

const NULL_TYPE = Object.prototype.toString.call(null);
const UNDEFINED_TYPE = Object.prototype.toString.call(undefined);

export type ValidationError = string | NativeError;

type IsMissing = (inputValue: unknown) => boolean;
export const isMissing: IsMissing = (inputValue) => {
  const inputType = Object.prototype.toString.call(inputValue);
  return (
    inputType.toLowerCase() === NULL_TYPE.toLowerCase() ||
    inputType.toLowerCase() === UNDEFINED_TYPE.toLowerCase()
  );
};

type CompareType = (inputValue: unknown, expectedType: string) => boolean;
export const compareType: CompareType = (inputValue, expectedType) => {
  const inputType = Object.prototype.toString.call(inputValue);
  expectedType = `[object ${expectedType}]`;
  return inputType.toLowerCase() === expectedType.toLowerCase();
};

type Models = typeof User; // TODO: Add more models here as they are created.
interface QueryArgs {
  [key: string]: unknown;
}
interface Options {
  populate?: {
    [key: string]: string;
  };
}
interface GetModelInstanceOutput {
  error?: NativeError | string;
  modelInstance?: UserInstance; // TODO: Add more model instances here as they are created.
}
type GetModelInstance = (
  model: Models,
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
