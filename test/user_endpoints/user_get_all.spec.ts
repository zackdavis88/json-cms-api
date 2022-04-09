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
const apiRoute = '/users';
const serverUrl = getServerUrl();

describe('[User] Get All', () => {
  describe(`GET ${apiRoute}`, () => {
    let connection: Connection;
    let testUser: UserInstance;
    let authToken: string;

    beforeAll(async () => {
      connection = await connectDB();
      if (!connection) return 'could not connect to db';

      testUser = await createTestUser('Password1');
      await createTestUser('Password2');
      await createTestUser('Password3');
      await createTestUser('Password4');
      authToken = generateToken(testUser);
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

    it('should successfully return a list of users', (done) => {
      request(serverUrl)
        .get(apiRoute)
        .set('x-auth-token', authToken)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);

          const { message, users, page, itemsPerPage, totalPages, totalItems } = res.body;
          assert.strictEqual(message, 'user list has been successfully retrieved');
          assert.strictEqual(page, 1);
          assert.strictEqual(itemsPerPage, 10);
          assert(totalPages >= 1);
          assert(totalItems >= 4);
          assert(users);
          assert(users.length);
          const user = users[0];
          assert(user.username);
          assert(user.displayName);
          assert(user.createdOn);
          assert(!user._id);
          assert(!user.hash);
          assert(!user.apiKey);
          done();
        });
    });
  });
});
