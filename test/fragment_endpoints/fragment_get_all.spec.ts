import assert from 'assert';
import {
  getServerUrl,
  connectDatabase,
  createTestUser,
  createTestFragment,
  cleanupTestRecords,
  generateToken,
  Connection,
  UserInstance,
} from '../utils';
import request from 'supertest';
const apiRoute = '/fragments';
const serverUrl = getServerUrl();

describe('[Fragment] Get All', () => {
  describe(`GET ${apiRoute}`, () => {
    let connection: Connection;
    let testUser: UserInstance;
    let authToken: string;

    beforeAll(async () => {
      connection = await connectDatabase();
      if (!connection) return 'could not connect to db';

      testUser = await createTestUser('Password1');
      authToken = generateToken(testUser);
      await createTestFragment(testUser);
      await createTestFragment(testUser);
      await createTestFragment(testUser);
      await createTestFragment(testUser);
      await createTestFragment(testUser);
      await createTestFragment(testUser);
      await createTestFragment(testUser);
      await createTestFragment(testUser);
      await createTestFragment(testUser);
      await createTestFragment(testUser);
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

    it('should successfully return a list of fragments', (done) => {
      request(serverUrl)
        .get(`${apiRoute}`)
        .set('x-auth-token', authToken)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);

          const { message, fragments, page, itemsPerPage, totalPages, totalItems } =
            res.body;
          assert.strictEqual(message, 'fragment list has been successfully retrieved');
          assert.strictEqual(page, 1);
          assert.strictEqual(itemsPerPage, 10);
          assert(totalPages >= 1);
          assert(totalItems >= 10);
          assert(fragments);
          assert(fragments.length);
          const { name, createdOn, createdBy } = fragments[0];
          assert(name);
          assert(createdOn);
          const { username, displayName } = createdBy;
          assert(username);
          assert(displayName);

          done();
        });
    });
  });
});
