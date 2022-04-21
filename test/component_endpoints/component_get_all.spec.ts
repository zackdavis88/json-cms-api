import assert from 'assert';
import {
  getServerUrl,
  connectDatabase,
  createTestUser,
  createTestBlueprint,
  createTestComponent,
  cleanupTestRecords,
  generateToken,
  Connection,
  UserInstance,
  BlueprintInstance,
} from '../utils';
import request from 'supertest';
const apiRoute = '/components';
const serverUrl = getServerUrl();

describe('[Component] Get All', () => {
  describe(`GET ${apiRoute}`, () => {
    let connection: Connection;
    let testUser: UserInstance;
    let testBlueprint: BlueprintInstance;
    let authToken: string;

    beforeAll(async () => {
      connection = await connectDatabase();
      if (!connection) return 'could not connect to db';

      testUser = await createTestUser('Password1');
      authToken = generateToken(testUser);
      testBlueprint = await createTestBlueprint(testUser);
      await createTestComponent(testUser, testBlueprint);
      await createTestComponent(testUser, testBlueprint);
      await createTestComponent(testUser, testBlueprint);
      await createTestComponent(testUser, testBlueprint);
      await createTestComponent(testUser, testBlueprint);
      await createTestComponent(testUser, testBlueprint);
      await createTestComponent(testUser, testBlueprint);
      await createTestComponent(testUser, testBlueprint);
      await createTestComponent(testUser, testBlueprint);
      await createTestComponent(testUser, testBlueprint);
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

    it('should successfully return a list of components', (done) => {
      request(serverUrl)
        .get(`${apiRoute}?itemsPerPage=5&page=2`)
        .set('x-auth-token', authToken)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);

          const { message, components, page, itemsPerPage, totalPages, totalItems } =
            res.body;
          assert.strictEqual(message, 'component list has been successfully retrieved');
          assert.strictEqual(page, 2);
          assert.strictEqual(itemsPerPage, 5);
          assert(totalPages >= 2);
          assert(totalItems >= 10);
          assert(components);
          assert(components.length);
          const { id, name, blueprint, version, createdOn, createdBy } = components[0];
          assert(id);
          assert(name);
          assert(createdOn);
          const { username, displayName } = createdBy;
          assert(username);
          assert(displayName);
          assert(version);
          assert(blueprint);
          const {
            name: blueprintName,
            version: blueprintVersion,
            id: blueprintId,
          } = blueprint;
          assert(blueprintName);
          assert(blueprintVersion);
          assert(blueprintId);
          done();
        });
    });
  });
});
