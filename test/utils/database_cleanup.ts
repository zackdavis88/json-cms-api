import {
  User,
  Blueprint,
  BlueprintVersion,
  Component,
  ComponentVersion,
  Layout,
} from '../../src/models';

let cleanupUsernames: string[] = [];
let cleanupBlueprints: string[] = [];
let cleanupComponents: string[] = [];
let cleanupLayouts: string[] = [];

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

export const cleanupTestRecords = () =>
  new Promise<void>((resolve) => {
    cleanupTestUsers(() => {
      cleanupTestComponents(() => {
        cleanupTestBlueprints(() => {
          cleanupTestLayouts(() => {
            resolve();
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
