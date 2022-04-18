import mongoose from 'mongoose';
import { Blueprint, BlueprintInstance } from '../../../models';

type ValidateBlueprint = (blueprintId: string) => Promise<BlueprintInstance>;
export const validateBlueprint: ValidateBlueprint = (blueprintId) =>
  new Promise((resolve, reject) => {
    if (!mongoose.Types.ObjectId.isValid(blueprintId)) {
      throw 'blueprintId is not valid';
    }

    const queryArgs = { _id: blueprintId, isActive: true };
    Blueprint.findOne(queryArgs)
      .then((blueprint) => {
        if (!blueprint) {
          throw 'blueprint does not exist';
        }

        resolve(blueprint);
      })
      .catch((findOneError) => {
        reject(findOneError);
      });
  });
