import assert from 'assert';
import {
  getServerUrl,
  connectDatabase,
  createTestUser,
  cleanupTestRecords,
  generateToken,
  createTestFragment,
  Connection,
  UserInstance,
  FragmentInstance,
} from '../utils';
import request from 'supertest';
let apiRoute = '/fragments/:fragmentName';
const serverUrl = getServerUrl();

describe('[Fragment] Remove', () => {
  describe(`DELETE ${apiRoute}`, () => {
    let connection: Connection;
    let testUser: UserInstance;
    let authToken: string;
    let testFragment: FragmentInstance;
    let payload: {
      confirm?: unknown;
    };

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
      payload = { confirm: testFragment.name };
    });

    it('should reject requests when x-auth-token is missing', (done) => {
      request(serverUrl).delete(apiRoute).send(payload).expect(
        400,
        {
          error: 'x-auth-token header is missing from input',
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

    it('should reject requests when confirm does not match the fragment name', (done) => {
      payload.confirm = 'something wrong';
      request(serverUrl)
        .delete(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'confirm input must match the fragment name',
          },
          done,
        );
    });

    it('should successfully remove a fragment', (done) => {
      request(serverUrl)
        .delete(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);

          const { message, fragment } = res.body;

          assert.strictEqual(message, 'fragment has been successfully removed');
          assert(fragment);
          const { name, isActive, createdOn, createdBy, deletedOn, deletedBy } = fragment;
          assert.strictEqual(name, testFragment.name);
          assert.strictEqual(isActive, false);
          assert.strictEqual(
            new Date(createdOn).toString(),
            new Date(testFragment.createdOn).toString(),
          );
          assert(createdBy);
          assert.strictEqual(createdBy.username, testUser.username);
          assert.strictEqual(createdBy.displayName, testUser.displayName);
          assert(deletedOn);
          assert(deletedBy);
          assert.strictEqual(deletedBy.username, testUser.username);
          assert.strictEqual(deletedBy.displayName, testUser.displayName);
          done();
        });
    });
  });
});
