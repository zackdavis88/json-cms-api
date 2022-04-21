import assert from 'assert';
import {
  getServerUrl,
  connectDatabase,
  createTestUser,
  cleanupTestRecords,
  generateToken,
  addFragmentForCleanup,
  createTestFragment,
  Connection,
  UserInstance,
  defaultFragmentContent,
  FragmentInstance,
} from '../utils';
import request from 'supertest';
const apiRoute = '/fragments';
const serverUrl = getServerUrl();

describe('[Fragment] Create', () => {
  describe(`POST ${apiRoute}`, () => {
    let connection: Connection;
    let testUser: UserInstance;
    let authToken: string;
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
      testFragment = await createTestFragment(testUser, {
        content: 'now THIS is content.',
      });
    });

    afterAll(async () => {
      await cleanupTestRecords();
      await connection.close();
    });

    beforeEach(() => {
      payload = {
        name: 'Unit-test-fragment',
        content: { ...defaultFragmentContent },
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
      payload.name = testFragment.name;
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

    it('should successfully create a new fragment', (done) => {
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);

          const { message, fragment } = res.body;

          assert.strictEqual(message, 'fragment has been successfully created');
          assert(fragment);

          const { name, content, createdOn, createdBy } = fragment;
          addFragmentForCleanup(name);
          assert.strictEqual(name, String(payload.name).toLowerCase());
          assert(createdOn);
          assert(createdBy);
          assert.strictEqual(createdBy.username, testUser.username);
          assert.strictEqual(createdBy.displayName, testUser.displayName);
          if (typeof content === 'object') {
            assert.deepStrictEqual(content, payload.content);
          } else {
            assert.strictEqual(content, payload.content);
          }

          done();
        });
    });
  });
});
