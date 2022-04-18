import mongoose from 'mongoose';
import {
  Component,
  ComponentInstance,
  BlueprintInstance,
  UserInstance,
} from '../../src/models';
import { addComponentForCleanup } from './database_cleanup';
import { defaultComponentContent } from '../utils';

interface ComponentCreateOverrides {
  name?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content?: any;
  version?: number;
  blueprintVersion?: number;
}

export const createTestComponent = (
  user: UserInstance,
  blueprint: BlueprintInstance,
  overrides: ComponentCreateOverrides = {},
) =>
  new Promise<ComponentInstance>((resolve) => {
    const name = overrides.name || new mongoose.Types.ObjectId().toString();
    const content = overrides.content || { ...defaultComponentContent };
    const version = overrides.version || 1;
    const blueprintVersion = overrides.blueprintVersion || blueprint.version;

    const testComponent = {
      name,
      content,
      isActive: true,
      blueprint: blueprint._id,
      blueprintVersion: blueprintVersion,
      createdOn: new Date(),
      createdBy: user._id,
      version,
    };

    Component.create(testComponent, (createErr, component: ComponentInstance) => {
      if (createErr) return console.error(createErr);

      addComponentForCleanup(component._id);
      resolve(component);
    });
  });
