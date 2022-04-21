import mongoose from 'mongoose';
import {
  Blueprint,
  BlueprintInstance,
  BlueprintField,
  UserInstance,
} from '../../src/models';
import { addBlueprintForCleanup } from './database_cleanup';
import { defaultBlueprintFields } from '../utils';

interface BlueprintCreateOverrides {
  name?: string;
  fields?: BlueprintField[];
  version?: number;
}

export const createTestBlueprint = (
  user: UserInstance,
  overrides: BlueprintCreateOverrides = {},
) =>
  new Promise<BlueprintInstance>((resolve) => {
    const name = overrides.name || new mongoose.Types.ObjectId().toString();
    const fields = overrides.fields || [...defaultBlueprintFields.fields];
    const version = overrides.version || 1;

    const testBlueprint = {
      name,
      fields,
      isActive: true,
      createdOn: new Date(),
      createdBy: user._id,
      version,
    };

    Blueprint.create(testBlueprint, (createErr, blueprint: BlueprintInstance) => {
      if (createErr) return console.error(createErr);

      addBlueprintForCleanup(blueprint._id);
      resolve(blueprint);
    });
  });
