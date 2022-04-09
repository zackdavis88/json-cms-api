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
import { User, compareHash } from '../../src/models/user';
let apiRoute = '/users/:username';
const serverUrl = getServerUrl();

describe('[User] Update', () => {
  describe(`POST ${apiRoute}`, () => {
    let connection: Connection;
    let testUser: UserInstance;
    let testUser2: UserInstance;
    let authToken: string;
    let payload: {
      currentPassword?: unknown;
      password?: unknown;
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
      payload = {
        currentPassword: 'Password1',
        password: 'Password123',
      };
    });

    it('should reject requests when x-auth-token is missing', (done) => {
      request(serverUrl).post(apiRoute).expect(
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
        .post(apiRoute)
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

    it('should reject requests when currentPassword is missing', (done) => {
      payload.currentPassword = undefined;
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'current password is missing from input',
          },
          done,
        );
    });

    it('should reject requests when currentPassword is not a string', (done) => {
      payload.currentPassword = 123123236472374;
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'current password must be a string',
          },
          done,
        );
    });

    it('should reject requests when currentPassword is invalid', (done) => {
      payload.currentPassword = 'SomethingWrong1!';
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'current password is invalid',
          },
          done,
        );
    });

    it('should reject requests when password is missing', (done) => {
      payload.password = undefined;
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'password is missing from input',
          },
          done,
        );
    });

    it('should reject requests when password is not a string', (done) => {
      payload.password = { something: 'wrong' };
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'password must be a string',
          },
          done,
        );
    });

    it('should reject requests when password is less than 8 characters', (done) => {
      payload.password = 'short';
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'password must be at least 8 characters in length',
          },
          done,
        );
    });

    it('should reject requests when password has no uppercase characters', (done) => {
      payload.password = 'password1';
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'password must have 1 uppercase, lowercase, and number character',
          },
          done,
        );
    });

    it('should reject requests when password has no lowercase characters', (done) => {
      payload.password = 'PASSWORD1';
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'password must have 1 uppercase, lowercase, and number character',
          },
          done,
        );
    });

    it('should reject requests when password has no number characters', (done) => {
      payload.password = 'Password_One';
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'password must have 1 uppercase, lowercase, and number character',
          },
          done,
        );
    });

    it('should successfully update a users password', (done) => {
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);

          const { message, user } = res.body;
          assert.strictEqual(message, 'user password has been successfully updated');
          assert(user);
          assert.strictEqual(user.username, testUser.username);
          assert.strictEqual(user.displayName, testUser.displayName);
          assert.strictEqual(
            new Date(user.createdOn).toString(),
            testUser.createdOn.toString(),
          );
          assert(user.updatedOn);

          // Validate that the new password is current.
          User.findOne(
            { username: testUser.username },
            (err: Error, testUser: UserInstance) => {
              if (err) return done(err);

              compareHash(
                payload.password as string,
                testUser.hash,
                (err: Error, isValid) => {
                  if (err) return done(err);

                  assert(isValid);
                  done();
                },
              );
            },
          );
        });
    });
  });
});
