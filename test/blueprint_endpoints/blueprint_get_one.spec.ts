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
  defaultBlueprintFields,
} from '../utils';
import request from 'supertest';
let apiRoute = '/blueprints/:blueprintId';
const serverUrl = getServerUrl();

describe('[Blueprint] Get One', () => {
  describe(`GET ${apiRoute}`, () => {
    let connection: Connection;
    let testUser: UserInstance;
    let testBlueprint: BlueprintInstance;
    let authToken: string;

    beforeAll(async () => {
      connection = await connectDatabase();
      if (!connection) return 'could not connect to db';

      testUser = await createTestUser('Password1');
      testBlueprint = await createTestBlueprint(testUser);
      authToken = generateToken(testUser);
    });

    afterAll(async () => {
      await cleanupTestRecords();
      await connection.close();
    });

    beforeEach(() => {
      apiRoute = `/blueprints/${testBlueprint._id}`;
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

    it('should reject requests when the requested blueprint is not found', (done) => {
      apiRoute = '/blueprints/impo$$ibleId';
      request(serverUrl).get(apiRoute).set('x-auth-token', authToken).expect(
        404,
        {
          error: 'requested blueprint not found',
        },
        done,
      );
    });

    it('should successfully return blueprint details', (done) => {
      request(serverUrl)
        .get(apiRoute)
        .set('x-auth-token', authToken)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          const { message, blueprint } = res.body;
          assert.strictEqual(message, 'blueprint has been successfully retrieved');
          assert(blueprint);

          const { id, name, createdOn, createdBy, fields } = blueprint;
          assert.strictEqual(id, testBlueprint.id);
          assert.strictEqual(name, testBlueprint.name);
          assert.strictEqual(
            new Date(createdOn).toString(),
            new Date(testBlueprint.createdOn).toString(),
          );
          assert(createdBy);
          assert.strictEqual(createdBy.username, testUser.username);
          assert.strictEqual(createdBy.displayName, testUser.displayName);

          assert(fields);
          assert(Array.isArray(fields));
          assert.strictEqual(fields.length, testBlueprint.fields.length);
          assert.deepEqual(fields, defaultBlueprintFields.fields);
          done();
        });
    });
  });
});
