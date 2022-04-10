import assert from 'assert';
import {
  getServerUrl,
  connectDatabase,
  createTestUser,
  cleanupTestRecords,
  generateToken,
  addBlueprintForCleanup,
  Connection,
  UserInstance,
  BlueprintCreatePayload,
} from '../utils';
import request from 'supertest';
import { blueprintCreatePayload as samplePayload } from '../utils';
const apiRoute = '/blueprints';
const serverUrl = getServerUrl();

describe('[Blueprint] Create', () => {
  describe(`POST ${apiRoute}`, () => {
    let connection: Connection;
    let testUser: UserInstance;
    let authToken: string;
    let payload: {
      name?: unknown;
      fields?: unknown;
    };

    beforeAll(async () => {
      connection = await connectDatabase();
      if (!connection) return 'could not connect to db';

      testUser = await createTestUser('Password1');
      authToken = generateToken(testUser);
    });

    afterAll(async () => {
      await cleanupTestRecords();
      await connection.close();
    });

    beforeEach(() => {
      payload = { ...samplePayload };
    });

    it('should reject requests when x-auth-token is missing', (done) => {
      request(serverUrl).post(apiRoute).expect(
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

    it('should reject requests when fields is missing', (done) => {
      payload.fields = undefined;
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'fields is missing from input',
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

    it('should reject requests when object-field name contains invalid characters', (done) => {
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

    it('should reject requests when an object-field object-type does not contain fields', (done) => {
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

    it('should reject requests when an object-field object-type contains an empty fields array', (done) => {
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

    it('should reject requests when an object-field object-type contains an empty fields array', (done) => {
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

    it('should successfully create a new blueprint', (done) => {
      const successPayload: BlueprintCreatePayload = {
        ...payload,
      } as BlueprintCreatePayload;
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(successPayload)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);

          const { message, blueprint } = res.body;
          assert.strictEqual(message, 'blueprint has been successfully created');

          const { id, name, fields, createdOn, createdBy } = blueprint;
          assert(id);
          addBlueprintForCleanup(id);
          assert.strictEqual(name, successPayload.name);
          assert(createdOn);
          assert(createdBy);
          assert.strictEqual(createdBy.username, testUser.username);
          assert.strictEqual(createdBy.displayName, testUser.displayName);

          const { type, name: fieldName, id: fieldId } = fields[0];
          assert.strictEqual(type, successPayload.fields[0].type);
          assert.strictEqual(fieldName, successPayload.fields[0].name);
          assert(fieldId);
          done();
        });
    });
  });
});
