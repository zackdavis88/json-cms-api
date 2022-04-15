import assert from 'assert';
import {
  getServerUrl,
  connectDatabase,
  createTestUser,
  cleanupTestRecords,
  generateToken,
  Connection,
  UserInstance,
  BlueprintInstance,
  createTestBlueprint,
  defaultBlueprintFields,
  removeFieldIds,
} from '../utils';
import request from 'supertest';
import { blueprintUpdatePayload as samplePayload } from '../utils';
import { BlueprintVersion, BlueprintVersionInstance } from '../../src/models';
let apiRoute = '/blueprints/:blueprintId';
const serverUrl = getServerUrl();

describe('[Blueprint] Update', () => {
  describe(`POST ${apiRoute}`, () => {
    let connection: Connection;
    let testUser: UserInstance;
    let testBlueprint: BlueprintInstance;
    let authToken: string;
    let payload: {
      name?: unknown;
      fields?: unknown;
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
      payload = { ...samplePayload };
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

    it('should reject requests when the blueprintId is invalid', (done) => {
      apiRoute = '/blueprints/a';
      request(serverUrl).post(apiRoute).set('x-auth-token', authToken).expect(
        400,
        {
          error: 'blueprintId is not valid',
        },
        done,
      );
    });

    it('should reject requests when input contains no update data', (done) => {
      payload = { name: undefined, fields: undefined };
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'request contains no update data',
          },
          done,
        );
    });

    it('should reject requests when name is not a string', (done) => {
      payload.name = { something: 'wrong' };
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
      payload.name = 'abc-_+=&^%$#@!/|{}()?.,<>;\':"*]';
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

    it('should reject requests when fields is not an array', (done) => {
      payload.fields = '';
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'fields must be an array of field objects',
          },
          done,
        );
    });

    it('should reject requests when fields is an empty array', (done) => {
      payload.fields = [];
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'fields must contain at least 1 field object',
          },
          done,
        );
    });

    it('should reject requests when a field-object is not an object', (done) => {
      payload.fields = ['something'];
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'blueprint fields contains a value that is not an object',
          },
          done,
        );
    });

    it('should reject requests when a field-object type is missing', (done) => {
      payload.fields = [{}];
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'blueprint field object type is missing',
          },
          done,
        );
    });

    it('should reject requests when a field-object type is not a string', (done) => {
      payload.fields = [{ type: { something: 'wrong' } }];
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'blueprint field object type must be a string',
          },
          done,
        );
    });

    it('should reject requests when a field-object type is not a valid type', (done) => {
      payload.fields = [{ type: 'WRONG' }];
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'blueprint field object type is invalid',
          },
          done,
        );
    });

    it('should reject requests when a field-object name is missing', (done) => {
      payload.fields = [{ type: 'NUMBER' }];
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'blueprint field object name is missing',
          },
          done,
        );
    });

    it('should reject requests when a field-object name is not a string', (done) => {
      payload.fields = [{ type: 'NUMBER', name: false }];
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'blueprint field object name must be a string',
          },
          done,
        );
    });

    it('should reject requests when a field-object name is less than 1 character', (done) => {
      payload.fields = [{ type: 'STRING', name: '' }];
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'blueprint field object name must be 1 - 100 characters in length',
          },
          done,
        );
    });

    it('should reject requests when a field-object name is more than 100 characters', (done) => {
      payload.fields = [{ type: 'DATE', name: Array(101).fill('b').join('') }];
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'blueprint field object name must be 1 - 100 characters in length',
          },
          done,
        );
    });

    it('should reject requests when field-object name contains invalid characters', (done) => {
      payload.fields = [
        {
          type: 'ARRAY',
          name: 'testArray',
          arrayOf: { type: 'NUMBER', name: 'abc-_+=&^%$#@!/|{}()?.,<>;\':"*]' },
        },
      ];
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'testArray field object name contains invalid characters',
          },
          done,
        );
    });

    it('should reject requests when a field-object isRequired is not a boolean', (done) => {
      payload.fields = [{ type: 'DATE', name: 'testDate', isRequired: 'no' }];
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'blueprint field object isRequired must be a boolean',
          },
          done,
        );
    });

    it('should reject requests when a field-object isInteger is not a boolean', (done) => {
      payload.fields = [{ type: 'NUMBER', name: 'testNumber', isInteger: 'yes' }];
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'blueprint field object isInteger must be a boolean',
          },
          done,
        );
    });

    it('should reject requests when a field-object regex is not a string', (done) => {
      payload.fields = [{ type: 'STRING', name: 'testString', regex: false }];
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'blueprint field object regex must be a string',
          },
          done,
        );
    });

    it('should reject requests when a field-object min is not a number', (done) => {
      payload.fields = [{ type: 'NUMBER', name: 'testNumber', min: false }];
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'blueprint field object min must be a number',
          },
          done,
        );
    });

    it('should reject requests when a field-object max is not a number', (done) => {
      payload.fields = [{ type: 'NUMBER', name: 'testNumber', max: '5' }];
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'blueprint field object max must be a number',
          },
          done,
        );
    });

    it('should reject requests when a field-object array-type does not contain arrayOf', (done) => {
      payload.fields = [{ type: 'ARRAY', name: 'testArray' }];
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'blueprint field object contains an array-type without arrayOf',
          },
          done,
        );
    });

    it('should reject requests when arrayOf is not a field-object', (done) => {
      payload.fields = [{ type: 'ARRAY', name: 'testArray', arrayOf: '' }];
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'blueprint field object arrayOf must be a field object',
          },
          done,
        );
    });

    it('should reject requests when arrayOf contains an array-type field-object', (done) => {
      payload.fields = [{ type: 'ARRAY', name: 'testArray', arrayOf: { type: 'ARRAY' } }];
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'blueprint field object arrayOf can not contain an array-type',
          },
          done,
        );
    });

    it('should reject requests when an field-object object-type does not contain fields', (done) => {
      payload.fields = [{ type: 'OBJECT', name: 'testObject' }];
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'blueprint field object contains an object-type without fields',
          },
          done,
        );
    });

    it('should reject requests when an field-object object-type contains an empty fields array', (done) => {
      payload.fields = [{ type: 'OBJECT', name: 'testObject', fields: [] }];
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error:
              'blueprint field object contains an object-type with an empty fields array',
          },
          done,
        );
    });

    it('should reject requests when an field-object object-type contains an empty fields array', (done) => {
      payload.fields = [
        {
          type: 'OBJECT',
          name: 'testObject',
          fields: [{ type: 'OBJECT', name: 'testObjectNested', fields: 'wrong' }],
        },
      ];
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'testObject field object fields must be an array of field objects',
          },
          done,
        );
    });

    it('should reject requests when fields contains field-objects with duplicate names', (done) => {
      const duplicateName = 'testObject';
      payload.fields = [
        {
          type: 'OBJECT',
          name: duplicateName,
          fields: [{ type: 'STRING', name: 'testStringNested', fields: [] }],
        },
        {
          type: 'OBJECT',
          name: duplicateName,
          fields: [{ type: 'STRING', name: 'testStringNested', fields: [] }],
        },
      ];
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: `blueprint fields contains duplicate name value: ${duplicateName}`,
          },
          done,
        );
    });

    it('should successfully update a blueprints name', (done) => {
      payload.fields = undefined;
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);

          const { message, blueprint } = res.body;
          assert.strictEqual(message, 'blueprint has been successfully updated');

          const {
            id,
            name,
            fields,
            createdOn,
            createdBy,
            updatedOn,
            updatedBy,
            version,
          } = blueprint;
          assert.strictEqual(id, testBlueprint.id);
          assert.strictEqual(name, payload.name);
          assert.strictEqual(
            new Date(createdOn).toString(),
            new Date(testBlueprint.createdOn).toString(),
          );
          assert(createdBy);
          assert.strictEqual(createdBy.username, testUser.username);
          assert.strictEqual(createdBy.displayName, testUser.displayName);

          assert(updatedOn);
          assert(updatedBy);
          assert.strictEqual(updatedBy.username, testUser.username);
          assert.strictEqual(updatedBy.displayName, testUser.displayName);

          assert.deepStrictEqual(fields, defaultBlueprintFields.fields); // Test will break if testBlueprint is made with a schema other than the default.

          assert.strictEqual(version, testBlueprint.version); // Blueprint version will remain the same for name-only changes.
          done();
        });
    });

    it('should successfully update a blueprints fields', (done) => {
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(200)
        .end(async (err, res) => {
          if (err) return done(err);

          const { message, blueprint } = res.body;
          assert.strictEqual(message, 'blueprint has been successfully updated');

          const { id, fields, createdOn, createdBy, updatedOn, updatedBy, version } =
            blueprint;
          assert.strictEqual(id, testBlueprint.id);
          assert.strictEqual(
            new Date(createdOn).toString(),
            new Date(testBlueprint.createdOn).toString(),
          );
          assert(createdBy);
          assert.strictEqual(createdBy.username, testUser.username);
          assert.strictEqual(createdBy.displayName, testUser.displayName);

          assert(updatedOn);
          assert(updatedBy);
          assert.strictEqual(updatedBy.username, testUser.username);
          assert.strictEqual(updatedBy.displayName, testUser.displayName);

          const fieldsWithoutIds = removeFieldIds(fields);
          assert.deepStrictEqual(fieldsWithoutIds, samplePayload.fields);

          assert.strictEqual(version, testBlueprint.version + 1); // Blueprint version will increase when fields is updated.

          // Ensure that the previous fields were stored in a blueprint version.
          let blueprintVersion: BlueprintVersionInstance;
          try {
            const queryArgs = {
              blueprintId: testBlueprint._id,
              version: testBlueprint.version,
            };
            blueprintVersion = await BlueprintVersion.findOne(queryArgs).exec();
          } catch (findError) {
            return done(findError);
          }

          assert(blueprintVersion);

          assert.deepStrictEqual(
            blueprintVersion.toObject().fields,
            defaultBlueprintFields.fields,
          );
          done();
        });
    });
  });
});
