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
let apiRoute = '/users/:username';
const serverUrl = getServerUrl();

describe('[User] Get One', () => {
  describe(`GET ${apiRoute}`, () => {
    let connection: Connection;
    let testUser: UserInstance;
    let testUser2: UserInstance;
    let authToken: string;

    beforeAll(async () => {
      connection = await connectDatabase();
      if (!connection) return 'could not connect to db';

      testUser = await createTestUser('Password1');
      testUser2 = await createTestUser('Password2');
      authToken = generateToken(testUser);
    });

    afterAll(async () => {
      await cleanupTestRecords();
      await connection.close();
    });

    beforeEach(() => {
      apiRoute = `/users/${testUser2.username}`;
    });

    it('should reject requests when x-auth-token is missing', (done) => {
      request(serverUrl).get(apiRoute).expect(
        400,
        {
          error: 'x-auth-token header is missing from input',
        },
        done,
      );
    });

    it('should reject requests when the requested user is not found', (done) => {
      apiRoute = '/users/impo$$ible';
      request(serverUrl).get(apiRoute).set('x-auth-token', authToken).expect(
        404,
        {
          error: 'requested user not found',
        },
        done,
      );
    });

    it('should successfully return user details', (done) => {
      request(serverUrl)
        .get(apiRoute)
        .set('x-auth-token', authToken)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);

          const { message, user } = res.body;
          assert.strictEqual(message, 'user has been successfully retrieved');
          const { username, displayName, createdOn } = user;
          assert.strictEqual(username, testUser2.username);
          assert.strictEqual(displayName, testUser2.displayName);
          assert.strictEqual(
            new Date(createdOn).toString(),
            testUser2.createdOn.toString(),
          );
          done();
        });
    });
  });
});
