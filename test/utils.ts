// tslint:disable:no-console
import fs from 'fs';
import { User, UserInstance, generateHash, generateKey } from '../src/models';
import { PORT } from '../src/config';
import { DB_HOST, DB_PORT, DB_NAME, DB_OPTIONS } from '../src/config/db';
import mongoose, { Connection } from 'mongoose';
let cleanupUsernames: string[] = [];
const databaseUrl = `mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}`;
let dbConnection: Connection = null;

export const connectDB = () =>
  new Promise<Connection>((resolve) => {
    if (dbConnection) return resolve(dbConnection);
    mongoose.connect(databaseUrl, DB_OPTIONS);
    const db = mongoose.connection;
    db.on('error', () => {
      console.error('Unit Tests DB Error');
      resolve(null);
    });
    db.once('open', () => {
      dbConnection = db;
      resolve(dbConnection);
    });
  });

export const createTestUser = (password: string) =>
  new Promise<UserInstance>((resolve) => {
    generateHash(password, (hashErr, hash) => {
      if (hashErr) return console.error(hashErr);

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
    });
  });

export const cleanupTestRecords = () =>
  new Promise((resolve) => {
    cleanupTestUsers(() => {
      return resolve(null);
    });
  });

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

export const addUsernameForCleanup = (username: string) => {
  cleanupUsernames.push(username.toLowerCase());
  return;
};

export const getServerUrl = () => {
  const certExists = fs.existsSync('../src/config/ssl/cert.pem');
  const keyExists = fs.existsSync('../src/config/ssl/key.pem');
  const protocol = certExists && keyExists ? 'https' : 'http';
  return `${protocol}://localhost:${PORT}`;
};
