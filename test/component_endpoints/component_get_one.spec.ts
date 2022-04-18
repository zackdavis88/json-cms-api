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
  BlueprintInstance,
  ComponentInstance,
  createTestComponent,
} from '../utils';
import request from 'supertest';
let apiRoute = '/components/:componentId';
const serverUrl = getServerUrl();

describe('[Component] Get One', () => {
  describe(`GET ${apiRoute}`, () => {
    let connection: Connection;
    let testUser: UserInstance;
    let testBlueprint: BlueprintInstance;
    let testComponent: ComponentInstance;
    let authToken: string;
    let blueprintWithMissingVersion: BlueprintInstance;
    let componentWithMissingBlueprint: ComponentInstance;

    beforeAll(async () => {
      connection = await connectDatabase();
      if (!connection) return 'could not connect to db';

      testUser = await createTestUser('Password1');
      testBlueprint = await createTestBlueprint(testUser);
      testComponent = await createTestComponent(testUser, testBlueprint);
      authToken = generateToken(testUser);

      blueprintWithMissingVersion = await createTestBlueprint(testUser, {
        version: 5,
      });
      componentWithMissingBlueprint = await createTestComponent(
        testUser,
        blueprintWithMissingVersion,
        { blueprintVersion: 1 },
      );
    });

    afterAll(async () => {
      await cleanupTestRecords();
      await connection.close();
    });

    beforeEach(() => {
      apiRoute = `/components/${testComponent._id}`;
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

    it('should reject requests when the componentId is invalid', (done) => {
      apiRoute = '/components/bad';
      request(serverUrl).get(apiRoute).set('x-auth-token', authToken).expect(
        400,
        {
          error: 'componentId is not valid',
        },
        done,
      );
    });

    it('should reject requests when the requested component is not found', (done) => {
      apiRoute = '/components/impo$$ibleId';
      request(serverUrl).get(apiRoute).set('x-auth-token', authToken).expect(
        404,
        {
          error: 'requested component not found',
        },
        done,
      );
    });

    it('should reject requests when the requested components blueprint is not found', (done) => {
      apiRoute = `/components/${componentWithMissingBlueprint._id}`;
      request(serverUrl).get(apiRoute).set('x-auth-token', authToken).expect(
        400,
        {
          error: 'blueprint version was not found',
        },
        done,
      );
    });

    it('should successfully return component details', (done) => {
      request(serverUrl)
        .get(apiRoute)
        .set('x-auth-token', authToken)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          const { message, component } = res.body;
          assert.strictEqual(message, 'component has been successfully retrieved');
          assert(component);

          const { id, name, createdOn, createdBy, content, blueprint, version } =
            component;
          assert.strictEqual(id, testComponent.id);
          assert.strictEqual(name, testComponent.name);
          assert.strictEqual(
            new Date(createdOn).toString(),
            new Date(testComponent.createdOn).toString(),
          );
          assert(createdBy);
          assert.strictEqual(createdBy.username, testUser.username);
          assert.strictEqual(createdBy.displayName, testUser.displayName);

          assert(content);
          assert.deepStrictEqual(content, testComponent.content);
          assert.strictEqual(version, 1);

          assert(blueprint);
          const {
            id: blueprintId,
            name: blueprintName,
            version: blueprintVersion,
          } = blueprint;
          assert.strictEqual(blueprintId, testBlueprint.id);
          assert.strictEqual(blueprintName, testBlueprint.name);
          assert.strictEqual(blueprintVersion, testBlueprint.version);

          done();
        });
    });
  });
});
