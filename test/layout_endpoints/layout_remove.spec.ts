import assert from 'assert';
import {
  getServerUrl,
  connectDatabase,
  createTestUser,
  createTestBlueprint,
  cleanupTestRecords,
  generateToken,
  Connection,
  UserInstance,
  createTestComponent,
  createTestLayout,
  LayoutInstance,
} from '../utils';
import request from 'supertest';
let apiRoute = '/layouts/:layoutId';
const serverUrl = getServerUrl();

describe('[Layout] Remove', () => {
  describe(`DELETE ${apiRoute}`, () => {
    let connection: Connection;
    let testUser: UserInstance;
    let authToken: string;
    let testLayout: LayoutInstance;
    let payload: {
      confirm?: unknown;
    };

    beforeAll(async () => {
      connection = await connectDatabase();
      if (!connection) return 'could not connect to db';

      testUser = await createTestUser('Password1');
      const testBlueprint = await createTestBlueprint(testUser);
      authToken = generateToken(testUser);
      const testComponent = await createTestComponent(testUser, testBlueprint);
      testLayout = await createTestLayout(testUser, [testComponent]);
    });

    afterAll(async () => {
      await cleanupTestRecords();
      await connection.close();
    });

    beforeEach(() => {
      apiRoute = `/layouts/${testLayout._id}`;
      payload = { confirm: testLayout.name };
    });

    it('should reject requests when x-auth-token is missing', (done) => {
      request(serverUrl).delete(apiRoute).expect(
        400,
        {
          error: 'x-auth-token header is missing from input',
        },
        done,
      );
    });

    it('should reject requests when the layoutId is invalid', (done) => {
      apiRoute = '/layouts/bad';
      request(serverUrl).delete(apiRoute).set('x-auth-token', authToken).expect(
        400,
        {
          error: 'layoutId is not valid',
        },
        done,
      );
    });

    it('should reject requests when the requested layout is not found', (done) => {
      apiRoute = '/layouts/impo$$ibleId';
      request(serverUrl).delete(apiRoute).set('x-auth-token', authToken).expect(
        404,
        {
          error: 'requested layout not found',
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
      payload.confirm = { do: 'it' };
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

    it('should reject requests when confirm is invalid', (done) => {
      payload.confirm = 'NotTheRightComponentName';
      request(serverUrl)
        .delete(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'confirm input must match the layout name',
          },
          done,
        );
    });

    it('should successfully remove a layout', (done) => {
      request(serverUrl)
        .delete(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(200)
        .end(async (err, res) => {
          if (err) return done(err);

          const { message, layout } = res.body;

          assert.strictEqual(message, 'layout has been successfully removed');
          assert(layout);
          assert.strictEqual(layout.id, testLayout.id);
          assert.strictEqual(layout.isActive, false);
          assert.strictEqual(layout.name, testLayout.name);
          assert.strictEqual(
            new Date(layout.createdOn).toString(),
            new Date(testLayout.createdOn).toString(),
          );
          assert(layout.createdBy);
          assert.strictEqual(layout.createdBy.username, testUser.username);
          assert.strictEqual(layout.createdBy.displayName, testUser.displayName);

          assert(layout.deletedOn);
          assert(layout.deletedBy);
          assert.strictEqual(layout.deletedBy.username, testUser.username);
          assert.strictEqual(layout.deletedBy.displayName, testUser.displayName);

          done();
        });
    });
  });
});
