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
  addFragmentForCleanup,
} from '../utils';
import request from 'supertest';
let apiRoute = '/fragments/:fragmentName';
const serverUrl = getServerUrl();

describe('[Fragment] Update', () => {
  describe(`POST ${apiRoute}`, () => {
    let connection: Connection;
    let testUser: UserInstance;
    let authToken: string;
    let existingTestFragment: FragmentInstance;
    let testFragment: FragmentInstance;
    let payload: {
      name?: unknown;
      content?: unknown;
    };

    beforeAll(async () => {
      connection = await connectDatabase();
      if (!connection) return 'could not connect to db';

      testUser = await createTestUser('Password1');
      authToken = generateToken(testUser);
      existingTestFragment = await createTestFragment(testUser, {
        content: 'now THIS is content.',
      });
      testFragment = await createTestFragment(testUser);
    });

    afterAll(async () => {
      await cleanupTestRecords();
      await connection.close();
    });

    beforeEach(() => {
      apiRoute = `/fragments/${testFragment.name}`;
      payload = {
        name: 'Unit-test-fragment-UPDATED',
        content: { something: { new: { and: { updated: [[['!']]] } } } },
      };
    });

    it('should reject requests when x-auth-token is missing', (done) => {
      request(serverUrl).post(apiRoute).send(payload).expect(
        400,
        {
          error: 'x-auth-token header is missing from input',
        },
        done,
      );
    });

    it('should reject requests when name is missing', (done) => {
      payload.name = undefined;
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'name is missing from input',
          },
          done,
        );
    });

    it('should reject requests when name is not a string', (done) => {
      payload.name = 34789;
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'name must be a string',
          },
          done,
        );
    });

    it('should reject requests when name is less than 1 character', (done) => {
      payload.name = '';
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'name must be 1 - 100 characters in length',
          },
          done,
        );
    });

    it('should reject requests when name is more than 100 characters', (done) => {
      payload.name = Array(101).fill('a').join('');
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'name must be 1 - 100 characters in length',
          },
          done,
        );
    });

    it('should reject requests when name contains invalid characters', (done) => {
      payload.name = 'This\\isnotvalid';
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'name contains invalid characters',
          },
          done,
        );
    });

    it('should reject requests when name is already taken', (done) => {
      payload.name = existingTestFragment.name;
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'fragment name is already taken',
          },
          done,
        );
    });

    it('should successfully update a fragment', (done) => {
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);

          const { message, fragment } = res.body;

          assert.strictEqual(message, 'fragment has been successfully updated');
          assert(fragment);

          const { name, content, createdOn, createdBy, updatedOn, updatedBy } = fragment;
          assert.strictEqual(name, String(payload.name).toLowerCase());
          addFragmentForCleanup(name);
          assert.strictEqual(
            new Date(createdOn).toString(),
            new Date(testFragment.createdOn).toString(),
          );
          assert(createdBy);
          assert.strictEqual(createdBy.username, testUser.username);
          assert.strictEqual(createdBy.displayName, testUser.displayName);
          assert(updatedOn);
          assert(updatedBy);
          assert.strictEqual(updatedBy.username, testUser.username);
          assert.strictEqual(updatedBy.displayName, testUser.displayName);
          assert.deepStrictEqual(content, payload.content);
          done();
        });
    });
  });
});
