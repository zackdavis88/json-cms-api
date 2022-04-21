import {
  User,
  Blueprint,
  BlueprintVersion,
  Component,
  ComponentVersion,
  Layout,
  Fragment,
} from '../../src/models';

let cleanupUsernames: string[] = [];
let cleanupBlueprints: string[] = [];
let cleanupComponents: string[] = [];
let cleanupLayouts: string[] = [];
let cleanupFragments: string[] = [];

const cleanupTestUsers = (callback: () => void) => {
  if (!cleanupUsernames.length) return callback();

  User.deleteMany(
    {
      username: { $in: cleanupUsernames },
    },
    (err) => {
      if (err) return console.error(err);

      cleanupUsernames = [];
      callback();
    },
  );
};

const cleanupTestBlueprints = (callback: () => void) => {
  if (!cleanupBlueprints.length) return callback();

  BlueprintVersion.deleteMany({ blueprintId: { $in: cleanupBlueprints } }, (err) => {
    if (err) return console.error(err);

    Blueprint.deleteMany({ _id: { $in: cleanupBlueprints } }, (err) => {
      if (err) return console.error(err);

      cleanupBlueprints = [];
      callback();
    });
  });
};

const cleanupTestComponents = (callback: () => void) => {
  if (!cleanupComponents.length) return callback();

  ComponentVersion.deleteMany({ componentId: { $in: cleanupComponents } }, (err) => {
    if (err) return console.error(err);

    Component.deleteMany({ _id: { $in: cleanupComponents } }, (err) => {
      if (err) return console.error(err);

      cleanupComponents = [];
      callback();
    });
  });
};

const cleanupTestLayouts = (callback: () => void) => {
  if (!cleanupLayouts.length) return callback();

  Layout.deleteMany({ _id: { $in: cleanupLayouts } }, (err) => {
    if (err) return console.error(err);

    cleanupLayouts = [];
    callback();
  });
};

const cleanupTestFragments = (callback: () => void) => {
  if (!cleanupFragments.length) return callback();

  Fragment.deleteMany({ name: { $in: cleanupFragments } }, (err) => {
    if (err) return console.error(err);

    cleanupFragments = [];
    callback();
  });
};

export const cleanupTestRecords = () =>
  new Promise<void>((resolve) => {
    cleanupTestUsers(() => {
      cleanupTestComponents(() => {
        cleanupTestBlueprints(() => {
          cleanupTestLayouts(() => {
            cleanupTestFragments(() => {
              resolve();
            });
          });
        });
      });
    });
  });

export const addUsernameForCleanup = (username: string) => {
  cleanupUsernames.push(username.toLowerCase());
  return;
};

export const addBlueprintForCleanup = (blueprintId: string) => {
  cleanupBlueprints.push(blueprintId);
  return;
};

export const addComponentForCleanup = (componentId: string) => {
  cleanupComponents.push(componentId);
  return;
};

export const addLayoutForCleanup = (layoutId: string) => {
  cleanupLayouts.push(layoutId);
  return;
};

export const addFragmentForCleanup = (fragmentName: string) => {
  cleanupFragments.push(fragmentName);
  return;
};
