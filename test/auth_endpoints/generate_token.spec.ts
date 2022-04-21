import assert from 'assert';
import {
  getServerUrl,
  connectDatabase,
  createTestUser,
  cleanupTestRecords,
  Connection,
  UserInstance,
} from '../utils';
import request from 'supertest';
const apiRoute = '/auth';
const serverUrl = getServerUrl();

describe('[Auth] Generate Token', () => {
  describe(`GET ${apiRoute}`, () => {
    let connection: Connection;
    let testUser: UserInstance;

    beforeAll(async () => {
      connection = await connectDatabase();
      if (!connection) return 'could not connect to db';

      testUser = await createTestUser('Password1');
    });

    afterAll(async () => {
      await cleanupTestRecords();
      await connection.close();
    });

    it('should reject requests when x-auth-basic is missing', (done) => {
      request(serverUrl).get(apiRoute).expect(
        400,
        {
          error: 'x-auth-basic header is missing from input',
        },
        done,
      );
    });

    it('should reject requests when the x-auth-basic header does not use Basic Auth', (done) => {
      request(serverUrl).get(apiRoute).set('x-auth-basic', 'SomethingWrong').expect(
        400,
        {
          error: 'x-auth-basic must use Basic Auth',
        },
        done,
      );
    });

    it('should reject requests when the x-auth-basic header has an invalid Basic Auth credential format', (done) => {
      const encodedCreds = Buffer.from('username/password').toString('base64');
      const basicAuthHeader = `Basic ${encodedCreds}`;
      request(serverUrl).get(apiRoute).set('x-auth-basic', basicAuthHeader).expect(
        400,
        {
          error: 'x-auth-basic credentials have invalid format',
        },
        done,
      );
    });

    it('should reject requests when the user does not exist', (done) => {
      const encodedCreds = Buffer.from('something:bad').toString('base64');
      const basicAuthHeader = `Basic ${encodedCreds}`;
      request(serverUrl).get(apiRoute).set('x-auth-basic', basicAuthHeader).expect(
        403,
        {
          error: 'username and password combination is invalid',
        },
        done,
      );
    });

    it('should reject requests when the password is invalid', (done) => {
      const encodedCreds = Buffer.from(`${testUser.username}:Password2`).toString(
        'base64',
      );
      const basicAuthHeader = `Basic ${encodedCreds}`;
      request(serverUrl).get(apiRoute).set('x-auth-basic', basicAuthHeader).expect(
        403,
        {
          error: 'username and password combination is invalid',
        },
        done,
      );
    });

    it('should successfully generate an authentication token', (done) => {
      const encodedCreds = Buffer.from(`${testUser.username}:Password1`).toString(
        'base64',
      );
      const basicAuthHeader = `Basic ${encodedCreds}`;
      request(serverUrl)
        .get(apiRoute)
        .set('x-auth-basic', basicAuthHeader)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);

          const { message, user } = res.body;
          assert.strictEqual(message, 'user successfully authenticated');
          assert(res.headers['x-auth-token']);
          assert(user);
          assert.strictEqual(user.username, testUser.username);
          assert.strictEqual(user.displayName, testUser.displayName);
          assert(user.createdOn);
          done();
        });
    });
  });
});
