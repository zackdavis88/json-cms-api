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
} from '../utils';
import request from 'supertest';
import { Blueprint } from '../../src/models';
let apiRoute = '/blueprints/:blueprintId';
const serverUrl = getServerUrl();

describe('[Blueprint] Remove', () => {
  describe(`DELETE ${apiRoute}`, () => {
    let connection: Connection;
    let testUser: UserInstance;
    let testBlueprint: BlueprintInstance;
    let authToken: string;
    let payload: {
      confirm?: unknown;
    };
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
      payload = { confirm: testBlueprint.name };
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

    it('should reject requests when confirm is invalid', (done) => {
      payload.confirm = 'NotTheRightBlueprintName';
      request(serverUrl)
        .delete(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'confirm input must match the blueprint name',
          },
          done,
        );
    });

    it('should successfully remove a user', (done) => {
      request(serverUrl)
        .delete(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);

          const { message, blueprint } = res.body;

          assert.strictEqual(message, 'blueprint has been successfully removed');
          assert(blueprint);
          assert.strictEqual(blueprint.id, testBlueprint.id);
          assert.strictEqual(blueprint.isActive, false);
          assert.strictEqual(blueprint.name, testBlueprint.name);
          assert.strictEqual(
            new Date(blueprint.createdOn).toString(),
            new Date(testBlueprint.createdOn).toString(),
          );
          assert(blueprint.createdBy);
          assert.strictEqual(blueprint.createdBy.username, testUser.username);
          assert.strictEqual(blueprint.createdBy.displayName, testUser.displayName);

          assert(blueprint.deletedOn);
          assert(blueprint.deletedBy);
          assert.strictEqual(blueprint.deletedBy.username, testUser.username);
          assert.strictEqual(blueprint.deletedBy.displayName, testUser.displayName);
          done();
        });
    });
  });
});
