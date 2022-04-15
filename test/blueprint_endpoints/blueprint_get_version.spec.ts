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
  BlueprintVersionInstance,
  updateTestBlueprint,
} from '../utils';
import request from 'supertest';
let apiRoute = '/blueprints/:blueprintId?version=versionNumber';
const serverUrl = getServerUrl();

describe('[BlueprintVersion] Get One', () => {
  describe(`GET ${apiRoute}`, () => {
    let connection: Connection;
    let testUser: UserInstance;
    let testBlueprint: BlueprintInstance;
    let testBlueprintVersion: BlueprintVersionInstance;
    let authToken: string;

    beforeAll(async () => {
      connection = await connectDatabase();
      if (!connection) return 'could not connect to db';

      testUser = await createTestUser('Password1');
      testBlueprint = await createTestBlueprint(testUser);
      const { blueprint: updatedBlueprint, version } = await updateTestBlueprint(
        testBlueprint,
      );
      testBlueprint = updatedBlueprint;
      testBlueprintVersion = version;
      authToken = generateToken(testUser);
    });

    afterAll(async () => {
      await cleanupTestRecords();
      await connection.close();
    });

    beforeEach(() => {
      apiRoute = `/blueprints/${testBlueprint._id}?version=${testBlueprintVersion.version}`;
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

    it('should reject requests when the blueprintId is invalid', (done) => {
      apiRoute = '/blueprints/a';
      request(serverUrl).get(apiRoute).set('x-auth-token', authToken).expect(
        400,
        {
          error: 'blueprintId is not valid',
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

    it('should successfully return the latest blueprint version if version input is not a number', (done) => {
      apiRoute = `/blueprints/${testBlueprint._id}?version=thisIsWrong`;
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

          const { id, name, fields, version } = blueprint;
          assert.strictEqual(id, testBlueprint.id);
          assert.strictEqual(name, testBlueprint.name);

          assert(fields);
          assert.deepStrictEqual(fields, testBlueprint.toObject().fields);
          assert.strictEqual(version, testBlueprint.version);
          done();
        });
    });

    it('should successfully return the latest blueprint version if version input less is than 1', (done) => {
      apiRoute = `/blueprints/${testBlueprint._id}?version=0`;
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

          const { id, name, fields, version } = blueprint;
          assert.strictEqual(id, testBlueprint.id);
          assert.strictEqual(name, testBlueprint.name);
          assert(fields);
          assert.deepStrictEqual(fields, testBlueprint.toObject().fields);
          assert.strictEqual(version, testBlueprint.version);
          done();
        });
    });

    it('should successfully return the latest blueprint version if version input is greater than latest', (done) => {
      apiRoute = `/blueprints/${testBlueprint._id}?version=3`;
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

          const { id, name, fields, version } = blueprint;
          assert.strictEqual(id, testBlueprint.id);
          assert.strictEqual(name, testBlueprint.name);
          assert(fields);
          assert.deepStrictEqual(fields, testBlueprint.toObject().fields);
          assert.strictEqual(version, testBlueprint.version);
          done();
        });
    });

    it('should successfully return the latest blueprint version if version input is not an integer', (done) => {
      apiRoute = `/blueprints/${testBlueprint._id}?version=1.1`;
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

          const { id, name, fields, version } = blueprint;
          assert.strictEqual(id, testBlueprint.id);
          assert.strictEqual(name, testBlueprint.name);
          assert(fields);
          assert.deepStrictEqual(fields, testBlueprint.toObject().fields);
          assert.strictEqual(version, testBlueprint.version);
          done();
        });
    });

    it('should successfully return blueprint version details', (done) => {
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

          const { id, name, createdOn, createdBy, fields, version } = blueprint;
          assert.strictEqual(id, testBlueprint.id);
          assert.strictEqual(name, testBlueprintVersion.name);
          assert.strictEqual(
            new Date(createdOn).toString(),
            new Date(testBlueprint.createdOn).toString(),
          );
          assert(createdBy);
          assert.strictEqual(createdBy.username, testUser.username);
          assert.strictEqual(createdBy.displayName, testUser.displayName);

          assert(fields);
          assert.deepStrictEqual(fields, testBlueprintVersion.toObject().fields);
          assert.strictEqual(version, testBlueprintVersion.version);
          done();
        });
    });
  });
});
