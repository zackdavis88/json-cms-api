import { User, Blueprint } from '../../src/models';

let cleanupUsernames: string[] = [];
let cleanupBlueprints: string[] = [];

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
  if (!cleanupBlueprints) return callback();

  Blueprint.deleteMany({ _id: { $in: cleanupBlueprints } }, (err) => {
    if (err) return console.error(err);

    cleanupBlueprints = [];
    callback();
  });
};

export const cleanupTestRecords = () =>
  new Promise<void>((resolve) => {
    cleanupTestUsers(() => {
      cleanupTestBlueprints(() => {
        resolve();
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
