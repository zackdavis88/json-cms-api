import mongoose from 'mongoose';
import {
  Layout,
  ComponentInstance,
  UserInstance,
  LayoutInstance,
} from '../../src/models';
import { addLayoutForCleanup } from './database_cleanup';

interface LayoutCreateOverrides {
  name?: string;
}

export const createTestLayout = (
  user: UserInstance,
  components: ComponentInstance[],
  overrides: LayoutCreateOverrides = {},
) =>
  new Promise<LayoutInstance>((resolve) => {
    const name = overrides.name || new mongoose.Types.ObjectId().toString();

    const testLayout = {
      name,
      components: components.map((component) => component._id),
      isActive: true,
      createdOn: new Date(),
      createdBy: user._id,
    };

    Layout.create(testLayout, (createErr, layout: LayoutInstance) => {
      if (createErr) return console.error(createErr);

      addLayoutForCleanup(layout._id);
      resolve(layout);
    });
  });
