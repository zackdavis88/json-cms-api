import {
  User,
  Blueprint,
  BlueprintVersion,
  Component,
  ComponentVersion,
} from '../../src/models';

let cleanupUsernames: string[] = [];
let cleanupBlueprints: string[] = [];
let cleanupComponents: string[] = [];

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

export const cleanupTestRecords = () =>
  new Promise<void>((resolve) => {
    cleanupTestUsers(() => {
      cleanupTestComponents(() => {
        cleanupTestBlueprints(() => {
          resolve();
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
