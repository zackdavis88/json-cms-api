import assert from 'assert';
import {
  getServerUrl,
  connectDatabase,
  createTestUser,
  cleanupTestRecords,
  generateToken,
  Connection,
  UserInstance,
  createTestBlueprint,
  ComponentInstance,
  createTestComponent,
  createTestLayout,
  LayoutInstance,
} from '../utils';
import request from 'supertest';
let apiRoute = '/layouts/:layoutId';
const serverUrl = getServerUrl();

describe('[Layout] Update', () => {
  describe(`POST ${apiRoute}`, () => {
    let connection: Connection;
    let testUser: UserInstance;
    let testComponent1: ComponentInstance;
    let testComponent2: ComponentInstance;
    let testComponent3: ComponentInstance;
    let authToken: string;
    let testLayout: LayoutInstance;
    let payload: {
      name?: unknown;
      components?: unknown;
    };

    beforeAll(async () => {
      connection = await connectDatabase();
      if (!connection) return 'could not connect to db';

      testUser = await createTestUser('Password1');
      const testBlueprint = await createTestBlueprint(testUser);
      authToken = generateToken(testUser);
      testComponent1 = await createTestComponent(testUser, testBlueprint);
      testComponent2 = await createTestComponent(testUser, testBlueprint);
      testComponent3 = await createTestComponent(testUser, testBlueprint);
      const layoutComponents = [
        testComponent1,
        testComponent3,
        testComponent3,
        testComponent2,
      ];
      testLayout = await createTestLayout(testUser, layoutComponents);
    });

    afterAll(async () => {
      await cleanupTestRecords();
      await connection.close();
    });

    beforeEach(() => {
      apiRoute = `/layouts/${testLayout._id}`;
      payload = {
        name: 'unit-test-component-updated',
        components: [testComponent1._id],
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

    it('should reject requests when the layoutId is invalid', (done) => {
      apiRoute = '/layouts/wrong';
      request(serverUrl).post(apiRoute).set('x-auth-token', authToken).expect(
        400,
        {
          error: 'layoutId is not valid',
        },
        done,
      );
    });

    it('should reject requests when the requested layout is not found', (done) => {
      apiRoute = '/layouts/impo$$ibleId';
      request(serverUrl).post(apiRoute).set('x-auth-token', authToken).expect(
        404,
        {
          error: 'requested layout not found',
        },
        done,
      );
    });

    it('should reject requests when name is not a string', (done) => {
      payload.name = 12389;
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
      payload.name = Array(101).fill('z').join('');
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
      payload.name = 'This\\isnot\\valid';
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

    it('should reject requests when components is not an array', (done) => {
      payload.components = { component1: '', component2: '' };
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'components must be an array of componentIds',
          },
          done,
        );
    });

    it('should reject requests when components contains a non-string item', (done) => {
      payload.components = [12378, true];
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'components must be an array of valid ids',
          },
          done,
        );
    });

    it('should reject requests when components contains an invalid id', (done) => {
      payload.components = ['wrong'];
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'components must be an array of valid ids',
          },
          done,
        );
    });

    it('should reject requests when components contains an invalid id', (done) => {
      payload.components = [
        testComponent1._id,
        testComponent3._id,
        'impossibleId',
        testComponent2._id,
      ];
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'component with id impossibleId was not found',
          },
          done,
        );
    });

    it('should successfully update a layout', (done) => {
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);

          const { message, layout } = res.body;

          assert.strictEqual(message, 'layout has been successfully updated');
          assert(layout);

          const { id, name, components, createdOn, updatedOn, createdBy, updatedBy } =
            layout;
          assert.strictEqual(id, testLayout.id);
          assert.strictEqual(name, payload.name);
          assert.strictEqual(
            new Date(createdOn).toString(),
            new Date(testLayout.createdOn).toString(),
          );
          assert(updatedOn);
          assert(createdBy);
          assert.strictEqual(createdBy.username, testUser.username);
          assert.strictEqual(createdBy.displayName, testUser.displayName);
          assert(updatedBy);
          assert.strictEqual(updatedBy.username, testUser.username);
          assert.strictEqual(updatedBy.displayName, testUser.displayName);
          assert(components);
          assert(Array.isArray(components));
          assert.strictEqual(components.length, 1);

          const item = components[0];

          assert.strictEqual(item.id, testComponent1.id);
          assert.strictEqual(item.name, testComponent1.name);
          assert.strictEqual(item.version, testComponent1.version);
          assert.deepStrictEqual(item.content, testComponent1.content);
          done();
        });
    });
  });
});
