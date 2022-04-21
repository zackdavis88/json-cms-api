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
  FragmentInstance,
} from '../utils';
import request from 'supertest';
let apiRoute = '/fragments/:fragmentName';
const serverUrl = getServerUrl();

describe('[Fragment] Get One', () => {
  describe(`GET ${apiRoute}`, () => {
    let connection: Connection;
    let testUser: UserInstance;
    let testFragment: FragmentInstance;
    let authToken: string;

    beforeAll(async () => {
      connection = await connectDatabase();
      if (!connection) return 'could not connect to db';

      testUser = await createTestUser('Password1');
      authToken = generateToken(testUser);
      testFragment = await createTestFragment(testUser);
    });

    afterAll(async () => {
      await cleanupTestRecords();
      await connection.close();
    });

    beforeEach(() => {
      apiRoute = `/fragments/${testFragment.name}`;
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

    it('should reject requests when the fragment is not found', (done) => {
      apiRoute = '/fragments/something_improbable';
      request(serverUrl).get(apiRoute).set('x-auth-token', authToken).expect(
        404,
        {
          error: 'requested fragment not found',
        },
        done,
      );
    });

    it('should successfully return fragment details', (done) => {
      request(serverUrl)
        .get(apiRoute)
        .set('x-auth-token', authToken)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);

          const { message, fragment } = res.body;

          assert.strictEqual(message, 'fragment has been successfully retrieved');
          assert(fragment);
          const { name, content, createdOn, createdBy } = fragment;
          assert.strictEqual(name, testFragment.name);
          assert.deepStrictEqual(content, testFragment.content);
          assert.strictEqual(
            new Date(createdOn).toString(),
            new Date(testFragment.createdOn).toString(),
          );
          assert(createdBy);
          assert.strictEqual(createdBy.username, testUser.username);
          assert.strictEqual(createdBy.displayName, testUser.displayName);
          done();
        });
    });
  });
});
