import { isMissing, compareType } from '../../utils';
import mongoose from 'mongoose';
import { Component, ComponentInstance } from '../../../models';

type ValidateComponents = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  components: any,
  isRequired?: boolean,
) => Promise<ComponentInstance[] | void>;
export const validateComponents: ValidateComponents = (components, isRequired = true) =>
  new Promise((resolve, reject) => {
    if (isMissing(components) && !isRequired) {
      return resolve();
    } else if (isMissing(components) && isRequired) {
      return reject('components is missing from input');
    }

    if (!Array.isArray(components)) {
      return reject('components must be an array of componentIds');
    }

    // Dont think we want to enforce a min length on the array, we can allow it to be empty for now.

    // some-check on the array contents..everything needs to be a string and valid mongoose ObjectId
    const arrayContentError = components.some(
      (componentId) =>
        !compareType(componentId, 'string') ||
        !mongoose.Types.ObjectId.isValid(componentId),
    );

    if (arrayContentError) {
      return reject('components must be an array of valid ids');
    }

    Component.find({ _id: { $in: components } })
      .then((componentList) => {
        const componentIdList = componentList.map((component) =>
          component._id.toString(),
        );
        let missingId: string;
        const componentIsMissing = components.some((componentId) => {
          missingId = componentId;
          return !componentIdList.includes(componentId);
        });

        if (componentIsMissing) {
          return reject(`component with id ${missingId} was not found`);
        }

        resolve(componentList);
      })
      .catch((findError) => reject(findError));
  });
