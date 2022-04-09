import { User } from '../../src/models';

let cleanupUsernames: string[] = [];

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

export const cleanupTestRecords = () =>
  new Promise<void>((resolve) => {
    cleanupTestUsers(() => {
      return resolve();
    });
  });

export const addUsernameForCleanup = (username: string) => {
  cleanupUsernames.push(username.toLowerCase());
  return;
};
