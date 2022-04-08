/* eslint-disable @typescript-eslint/no-explicit-any */
import assert from 'assert';
import mongoose from 'mongoose';
import {
  getServerUrl,
  connectDB,
  createTestUser,
  cleanupTestRecords,
  addUsernameForCleanup,
  Connection,
} from '../utils';
import request from 'supertest';
const apiRoute = '/users';
const serverUrl = getServerUrl();

describe('[User] Create', () => {
  describe(`POST ${apiRoute}`, () => {
    let connection: Connection;
    let existingUsername: string;
    let payload: {
      username?: any;
      password?: any;
    };

    beforeAll(async () => {
      connection = await connectDB();
      if (!connection) return 'could not connect to db';

      const existingUser = await createTestUser('Password1');
      existingUsername = existingUser.username;
    });

    afterAll(async () => {
      await cleanupTestRecords();
      await connection.close();
    });

    beforeEach(() => {
      payload = {
        username: new mongoose.Types.ObjectId().toString().toUpperCase(),
        password: 'Password1',
      };
    });

    it('should reject requests when username is missing', (done) => {
      payload.username = undefined;
      request(serverUrl).post(apiRoute).send(payload).expect(
        400,
        {
          error: 'username is missing from input',
        },
        done,
      );
    });

    it('should reject requests when username is not a string', (done) => {
      payload.username = { something: 'wrong' };
      request(serverUrl).post(apiRoute).send(payload).expect(
        400,
        {
          error: 'username must be a string',
        },
        done,
      );
    });

    it('should reject requests when username is less than 3 characters', (done) => {
      payload.username = '12';
      request(serverUrl).post(apiRoute).send(payload).expect(
        400,
        {
          error: 'username must be 3 - 26 characters in length',
        },
        done,
      );
    });

    it('should reject requests when username is more than 26 characters', (done) => {
      payload.username = 'abcdefghijklmnopqrstuvwxyz1';
      request(serverUrl).post(apiRoute).send(payload).expect(
        400,
        {
          error: 'username must be 3 - 26 characters in length',
        },
        done,
      );
    });

    it('should reject requests when username contains invalid characters', (done) => {
      payload.username = 'u$ername!';
      request(serverUrl).post(apiRoute).send(payload).expect(
        400,
        {
          error:
            'username may only contain alphanumeric, - (dash), and _ (underscore) characters',
        },
        done,
      );
    });

    it('should reject requests when username is already taken', (done) => {
      payload.username = existingUsername;
      request(serverUrl).post(apiRoute).send(payload).expect(
        400,
        {
          error: 'username is already taken',
        },
        done,
      );
    });

    it('should reject requests when password is missing', (done) => {
      payload.password = undefined;
      request(serverUrl).post(apiRoute).send(payload).expect(
        400,
        {
          error: 'password is missing from input',
        },
        done,
      );
    });

    it('should reject requests when password is not a string', (done) => {
      payload.password = { something: 'wrong' };
      request(serverUrl).post(apiRoute).send(payload).expect(
        400,
        {
          error: 'password must be a string',
        },
        done,
      );
    });

    it('should reject requests when password is less than 8 characters', (done) => {
      payload.password = 'short';
      request(serverUrl).post(apiRoute).send(payload).expect(
        400,
        {
          error: 'password must be at least 8 characters in length',
        },
        done,
      );
    });

    it('should reject requests when password has no uppercase characters', (done) => {
      payload.password = 'password1';
      request(serverUrl).post(apiRoute).send(payload).expect(
        400,
        {
          error: 'password must have 1 uppercase, lowercase, and number character',
        },
        done,
      );
    });

    it('should reject requests when password has no lowercase characters', (done) => {
      payload.password = 'PASSWORD1';
      request(serverUrl).post(apiRoute).send(payload).expect(
        400,
        {
          error: 'password must have 1 uppercase, lowercase, and number character',
        },
        done,
      );
    });

    it('should reject requests when password has no number characters', (done) => {
      payload.password = 'Password_One';
      request(serverUrl).post(apiRoute).send(payload).expect(
        400,
        {
          error: 'password must have 1 uppercase, lowercase, and number character',
        },
        done,
      );
    });

    it('should successfully create a user', (done) => {
      request(serverUrl)
        .post(apiRoute)
        .send(payload)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);

          const { message, user } = res.body;
          assert.strictEqual(message, 'user has been successfully created');
          assert(user);
          assert.strictEqual(user.username, payload.username.toLowerCase());
          assert.strictEqual(user.displayName, payload.username);
          assert(user.createdOn);
          addUsernameForCleanup(user.username);
          done();
        });
    });
  });
});
