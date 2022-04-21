import assert from 'assert';
import {
  getServerUrl,
  connectDatabase,
  createTestUser,
  cleanupTestRecords,
  generateToken,
  Connection,
  UserInstance,
} from '../utils';
import request from 'supertest';
import { User } from '../../src/models/user';
let apiRoute = '/users/:username';
const serverUrl = getServerUrl();

describe('[User] Remove', () => {
  describe(`DELETE ${apiRoute}`, () => {
    let connection: Connection;
    let testUser: UserInstance;
    let testUser2: UserInstance;
    let authToken: string;
    let payload: {
      confirm?: unknown;
    };
    beforeAll(async () => {
      connection = await connectDatabase();
      if (!connection) return 'could not connect to db';

      testUser = await createTestUser('Password1');
      testUser2 = await createTestUser('Password1');
      authToken = generateToken(testUser);
    });

    afterAll(async () => {
      await cleanupTestRecords();
      await connection.close();
    });

    beforeEach(() => {
      apiRoute = `/users/${testUser.username}`;
      payload = { confirm: testUser.username };
    });

    it('should reject requests when x-auth-token is missing', (done) => {
      request(serverUrl).delete(apiRoute).expect(
        400,
        {
          error: 'x-auth-token header is missing from input',
        },
        done,
      );
    });

    it('should reject requests that are not authorized', (done) => {
      apiRoute = `/users/${testUser2.username}`; // User updates can only be performed on your own account.
      request(serverUrl)
        .delete(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          401,
          {
            error: 'you do not have permission to perform this action',
          },
          done,
        );
    });

    it('should reject requests when confirm is missing', (done) => {
      payload.confirm = undefined;
      request(serverUrl)
        .delete(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'confirm is missing from input',
          },
          done,
        );
    });

    it('should reject requests when confirm is not a string', (done) => {
      payload.confirm = true;
      request(serverUrl)
        .delete(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'confirm must be a string',
          },
          done,
        );
    });

    it('should reject requests when confirm is invalid', (done) => {
      payload.confirm = 'NotTheRightUsername';
      request(serverUrl)
        .delete(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'confirm input must match your username',
          },
          done,
        );
    });

    it('should successfully remove a user', (done) => {
      request(serverUrl)
        .delete(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);

          const { message, user } = res.body;
          assert.strictEqual(message, 'user has been successfully removed');
          assert(user);
          assert.strictEqual(user.username, testUser.username);
          assert.strictEqual(user.displayName, testUser.displayName);
          assert.strictEqual(
            new Date(user.createdOn).toString(),
            testUser.createdOn.toString(),
          );
          assert(user.deletedOn);

          User.findOne(
            { username: testUser.username },
            (err: Error, testUser: UserInstance) => {
              if (err) return done(err);

              assert.strictEqual(testUser.isActive, false);
              done();
            },
          );
        });
    });
  });
});
