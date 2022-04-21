import mongoose from 'mongoose';
import { User, UserInstance, generateHash, generateKey } from '../../src/models';
import { addUsernameForCleanup } from './database_cleanup';

export const createTestUser = (password: string) =>
  new Promise<UserInstance>((resolve) => {
    generateHash(password)
      .then((hash) => {
        const randomUsername = new mongoose.Types.ObjectId().toString();
        const testUser = {
          username: randomUsername.toLowerCase(),
          displayName: randomUsername.toUpperCase(),
          hash,
          apiKey: generateKey(),
          isActive: true,
          createdOn: new Date(),
        };

        User.create(testUser, (createErr, user: UserInstance) => {
          if (createErr) return console.error(createErr);

          addUsernameForCleanup(user.username);
          resolve(user);
        });
      })
      .catch((hashErr) => {
        console.error(hashErr);
      });
  });
