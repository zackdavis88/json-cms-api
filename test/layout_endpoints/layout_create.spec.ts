import assert from 'assert';
import {
  getServerUrl,
  connectDatabase,
  createTestUser,
  cleanupTestRecords,
  generateToken,
  addLayoutForCleanup,
  Connection,
  UserInstance,
  createTestBlueprint,
  ComponentInstance,
  createTestComponent,
} from '../utils';
import request from 'supertest';
const apiRoute = '/layouts';
const serverUrl = getServerUrl();

describe('[Layout] Create', () => {
  describe(`POST ${apiRoute}`, () => {
    let connection: Connection;
    let testUser: UserInstance;
    let testComponent1: ComponentInstance;
    let testComponent2: ComponentInstance;
    let testComponent3: ComponentInstance;
    let authToken: string;
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
    });

    afterAll(async () => {
      await cleanupTestRecords();
      await connection.close();
    });

    beforeEach(() => {
      payload = {
        name: 'unit-test-component',
        components: [testComponent1._id, testComponent2._id, testComponent3._id],
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

    it('should reject requests when components is missing', (done) => {
      payload.components = undefined;
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'components is missing from input',
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
      payload.components = [1];
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
      payload.components = ['bad'];
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

    it('should successfully create a new layout', (done) => {
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);

          const { message, layout } = res.body;

          assert.strictEqual(message, 'layout has been successfully created');
          assert(layout);

          const { id, name, components, createdOn, createdBy } = layout;
          assert(id);
          addLayoutForCleanup(id);
          assert.strictEqual(name, payload.name);
          assert(createdOn);
          assert(createdBy);
          assert.strictEqual(createdBy.username, testUser.username);
          assert.strictEqual(createdBy.displayName, testUser.displayName);
          assert(components);
          assert.strictEqual(Array.isArray(components), true);
          assert.strictEqual(components.length, 3);

          const [component1, component2, component3] = components;
          assert.strictEqual(component1.id, testComponent1.id);
          assert.strictEqual(component1.name, testComponent1.name);
          assert.strictEqual(component1.version, testComponent1.version);
          assert.deepStrictEqual(component1.content, testComponent1.content);

          assert.strictEqual(component2.id, testComponent2.id);
          assert.strictEqual(component2.name, testComponent2.name);
          assert.strictEqual(component2.version, testComponent2.version);
          assert.deepStrictEqual(component2.content, testComponent2.content);

          assert.strictEqual(component3.id, testComponent3.id);
          assert.strictEqual(component3.name, testComponent3.name);
          assert.strictEqual(component3.version, testComponent3.version);
          assert.deepStrictEqual(component3.content, testComponent3.content);
          done();
        });
    });
  });
});
