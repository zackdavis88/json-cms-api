import assert from 'assert';
import {
  getServerUrl,
  connectDB,
  createTestUser,
  cleanupTestRecords,
  generateToken,
  Connection,
  UserInstance,
} from '../utils';
import request from 'supertest';
const apiRoute = '/auth/token';
const serverUrl = getServerUrl();

describe('[Auth] Authenticate Token', () => {
  describe(`GET ${apiRoute}`, () => {
    let connection: Connection;
    let testUser: UserInstance;

    beforeAll(async () => {
      connection = await connectDB();
      if (!connection) return 'could not connect to db';

      testUser = await createTestUser('Password1');
    });

    afterAll(async () => {
      await cleanupTestRecords();
      await connection.close();
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

    it('should reject requests when x-auth-token is expired', (done) => {
      const tokenOverrides = {
        iat: Math.floor(Date.now() / 1000) - 60 * 61 * 10,
        exp: Math.floor(Date.now() / 1000),
      };
      const jwtToken = generateToken(testUser, tokenOverrides);
      request(serverUrl).get(apiRoute).set('x-auth-token', jwtToken).expect(
        400,
        {
          error: 'x-auth-token is expired',
        },
        done,
      );
    });

    it('should reject requests when x-auth-token is invalid', (done) => {
      // A Token is invalid when it has been encrypted using the wrong secret-key.
      const secretOverride = 'badSecret';
      const jwtToken = generateToken(testUser, {}, secretOverride);
      request(serverUrl).get(apiRoute).set('x-auth-token', jwtToken).expect(
        400,
        {
          error: 'x-auth-token is invalid',
        },
        done,
      );
    });

    it('should reject requests when x-auth-token does not contain expected fields', (done) => {
      const tokenOverrides: { apiKey: undefined } = { apiKey: undefined };
      const jwtToken = generateToken(testUser, tokenOverrides);
      request(serverUrl).get(apiRoute).set('x-auth-token', jwtToken).expect(
        400,
        {
          error: 'x-auth-token is missing required fields',
        },
        done,
      );
    });

    it('should reject requests when the x-auth-token _id field is invalid', (done) => {
      const tokenOverrides = { _id: 'something_wrong' };
      const jwtToken = generateToken(testUser, tokenOverrides);
      request(serverUrl).get(apiRoute).set('x-auth-token', jwtToken).expect(
        400,
        {
          error: 'x-auth-token contains an invalid id',
        },
        done,
      );
    });

    it('should reject requests when the x-auth-token apiKey is wrong', (done) => {
      const tokenOverrides = { apiKey: 'something-wrong-and-bad' };
      const jwtToken = generateToken(testUser, tokenOverrides);
      request(serverUrl).get(apiRoute).set('x-auth-token', jwtToken).expect(
        403,
        {
          error: 'x-auth-token user could not be authenticated',
        },
        done,
      );
    });

    it('should reject requests when the x-auth-token id is wrong', (done) => {
      const tokenOverrides = { _id: 'impossibleId' };
      const jwtToken = generateToken(testUser, tokenOverrides);
      request(serverUrl).get(apiRoute).set('x-auth-token', jwtToken).expect(
        403,
        {
          error: 'x-auth-token user could not be authenticated',
        },
        done,
      );
    });

    it('should successfully authenticate a token', (done) => {
      const jwtToken = generateToken(testUser);
      request(serverUrl)
        .get(apiRoute)
        .set('x-auth-token', jwtToken)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);

          const { message, user } = res.body;
          assert.strictEqual(message, 'user successfully authenticated via token');
          assert(user);
          assert.strictEqual(user.username, testUser.username);
          assert.strictEqual(user.displayName, testUser.displayName);
          assert(user.createdOn);
          done();
        });
    });
  });
});
