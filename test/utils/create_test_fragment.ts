import mongoose from 'mongoose';
import { Fragment, UserInstance, FragmentInstance } from '../../src/models';
import { addFragmentForCleanup } from './database_cleanup';
import { defaultFragmentContent } from './data';

interface FragmentCreateOverrides {
  name?: string;
  content?: unknown;
}

export const createTestFragment = (
  user: UserInstance,
  overrides: FragmentCreateOverrides = {},
) =>
  new Promise<FragmentInstance>((resolve) => {
    const name =
      (overrides.name && overrides.name.toLowerCase()) ||
      new mongoose.Types.ObjectId().toString().toLowerCase();
    const content = overrides.content || { ...defaultFragmentContent };

    const testFragment = {
      name,
      content,
      isActive: true,
      createdOn: new Date(),
      createdBy: user._id,
    };

    Fragment.create(testFragment, (createErr, fragment: FragmentInstance) => {
      if (createErr) return console.error(createErr);

      addFragmentForCleanup(fragment.name);
      resolve(fragment);
    });
  });
