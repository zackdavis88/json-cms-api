import assert from 'assert';
import {
  getServerUrl,
  connectDatabase,
  createTestUser,
  cleanupTestRecords,
  generateToken,
  Connection,
  UserInstance,
  defaultComponentUpdateContent,
  BlueprintInstance,
  createTestBlueprint,
  ComponentInstance,
  createTestComponent,
} from '../utils';
import { ComponentVersion, ComponentVersionInstance } from '../../src/models';
import request from 'supertest';
let apiRoute = '/components/:componentId';
const serverUrl = getServerUrl();

describe('[Component] Update', () => {
  describe(`POST ${apiRoute}`, () => {
    let connection: Connection;
    let testUser: UserInstance;
    let testBlueprint: BlueprintInstance;
    let testComponent: ComponentInstance;
    let authToken: string;
    let payload: {
      name?: unknown;
      content?: unknown;
    };
    let blueprintWithMissingVersion: BlueprintInstance;
    let componentWithMissingBlueprint: ComponentInstance;

    beforeAll(async () => {
      connection = await connectDatabase();
      if (!connection) return 'could not connect to db';

      testUser = await createTestUser('Password1');
      testBlueprint = await createTestBlueprint(testUser);
      authToken = generateToken(testUser);
      testComponent = await createTestComponent(testUser, testBlueprint);

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
      payload = {
        name: 'unit-test-component-updated',
        content: { ...defaultComponentUpdateContent },
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

    it('should reject requests when the componentId is invalid', (done) => {
      apiRoute = '/components/bad';
      request(serverUrl).post(apiRoute).set('x-auth-token', authToken).expect(
        400,
        {
          error: 'componentId is not valid',
        },
        done,
      );
    });

    it('should reject requests when the requested component is not found', (done) => {
      apiRoute = '/components/impo$$ibleId';
      request(serverUrl).post(apiRoute).set('x-auth-token', authToken).expect(
        404,
        {
          error: 'requested component not found',
        },
        done,
      );
    });

    it('should reject requests when the requested components blueprint is not found', (done) => {
      apiRoute = `/components/${componentWithMissingBlueprint._id}`;
      request(serverUrl).post(apiRoute).set('x-auth-token', authToken).expect(
        400,
        {
          error: 'blueprint version was not found',
        },
        done,
      );
    });

    it('should reject requests when input contains no update data', (done) => {
      payload = { name: undefined, content: undefined };
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

    it('should reject requests when content is not an object', (done) => {
      payload.content = [];
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error:
              'content must be an object of key/values following the component blueprint',
          },
          done,
        );
    });

    it('should reject requests when a field is required and is missing', (done) => {
      payload.content = {};
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'content field stringField is a required string',
          },
          done,
        );
    });

    it('should reject requests when a string field is not a string', (done) => {
      payload.content = { stringField: 1 };
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'content field stringField must be a string',
          },
          done,
        );
    });

    it('should reject requests when a string is less than the minimum', (done) => {
      payload.content = {
        stringField: 'test_string',
        arrayField: [
          {
            arrayNestedStringField: '',
            arrayNestedNumberField: 55,
          },
        ],
      };
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error:
              'arrayField field arrayNestedStringField must have a minimum length of 1',
          },
          done,
        );
    });

    it('should reject requests when a string is more than the maximum', (done) => {
      payload.content = {
        stringField: 'test_string',
        arrayField: [
          {
            arrayNestedStringField: Array(51).fill('a').join(''),
            arrayNestedNumberField: 55,
          },
        ],
      };
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error:
              'arrayField field arrayNestedStringField must have a maximum length of 50',
          },
          done,
        );
    });

    it('should reject requests when a boolean field is not a boolean', (done) => {
      payload.content = { stringField: 'test_field', booleanField: 1 };
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'content field booleanField must be a boolean',
          },
          done,
        );
    });

    it('should reject requests when a number field is not a number', (done) => {
      payload.content = { stringField: 'test_field', numberField: '1' };
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'content field numberField must be a number',
          },
          done,
        );
    });

    it('should reject requests when a number field that isInteger is not an integer', (done) => {
      payload.content = { stringField: 'test_field', numberField: 1.5 };
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'content field numberField must be an integer',
          },
          done,
        );
    });

    it('should reject requests when a number field is below the minimum', (done) => {
      payload.content = { stringField: 'test_field', numberField: 1 };
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'content field numberField must have a minimum value of 23',
          },
          done,
        );
    });

    it('should reject requests when a number field is above the maximum', (done) => {
      payload.content = { stringField: 'test_field', numberField: 56 };
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'content field numberField must have a maximum value of 55',
          },
          done,
        );
    });

    it('should reject requests when a date field is not a valid timestamp', (done) => {
      payload.content = { stringField: 'test_field', dateField: 'wrong' };
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'content field dateField must be a valid ISO timestamp string',
          },
          done,
        );
    });

    it('should reject requests when a date field is not a timestamp string', (done) => {
      payload.content = { stringField: 'test_field', dateField: 12323213 };
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'content field dateField must be an ISO timestamp string',
          },
          done,
        );
    });

    it('should reject requests when an object field is not an object', (done) => {
      payload.content = { stringField: 'test_field', objectField: false };
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'content field objectField must be an object',
          },
          done,
        );
    });

    it('should reject requests when an array field is not an array', (done) => {
      payload.content = { stringField: 'test_field', arrayField: false };
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'content field arrayField must be an array',
          },
          done,
        );
    });

    it('should reject requests when an array length is below the minimum', (done) => {
      payload.content = { stringField: 'test_field', arrayField: [] };
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'content field arrayField must have a minimum length of 1',
          },
          done,
        );
    });

    it('should reject requests when an array length is above the maximum', (done) => {
      payload.content = {
        stringField: 'test_field',
        arrayField: [{}, {}, {}, {}, {}, {}],
      };
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'content field arrayField must have a maximum length of 5',
          },
          done,
        );
    });

    it('should reject requests when an array of strings has a non-string item', (done) => {
      payload.content = {
        stringField: 'test_field',
        arrayOfStrings: ['1', 'two', 3],
      };
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'arrayOfStrings array field item must be a string',
          },
          done,
        );
    });

    it('should reject requests when an array of booleans has a non-boolean item', (done) => {
      payload.content = {
        stringField: 'test_field',
        arrayOfBooleans: [false, false, true, 'true'],
      };
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'arrayOfBooleans array field item must be a boolean',
          },
          done,
        );
    });

    it('should reject requests when an array of numbers has a non-number item', (done) => {
      payload.content = {
        stringField: 'test_field',
        arrayOfNumbers: [1, 2, [3, 4]],
      };
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'arrayOfNumbers array field item must be a number',
          },
          done,
        );
    });

    it('should reject requests when an array of dates has a non-date item', (done) => {
      payload.content = {
        stringField: 'test_field',
        arrayOfDates: [
          new Date().toISOString(),
          new Date().toISOString(),
          'not a good date',
        ],
      };
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'arrayOfDates array field item must be a valid ISO timestamp string',
          },
          done,
        );
    });

    it('should successfully update a component', (done) => {
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(200)
        .end(async (err, res) => {
          if (err) {
            return done(err);
          }

          const { message, component } = res.body;

          assert.strictEqual(message, 'component has been successfully updated');
          assert(component);
          const {
            id,
            name,
            blueprint,
            content,
            version,
            createdOn,
            createdBy,
            updatedOn,
            updatedBy,
          } = component;
          assert.strictEqual(id, testComponent.id);
          assert.strictEqual(name, payload.name);
          assert(blueprint);
          const {
            id: blueprintId,
            name: blueprintName,
            version: blueprintVersion,
          } = blueprint;
          assert.strictEqual(blueprintId, testBlueprint.id);
          assert.strictEqual(blueprintName, testBlueprint.name);
          assert.strictEqual(blueprintVersion, testBlueprint.version);
          assert.deepStrictEqual(content, payload.content);
          assert.strictEqual(
            new Date(createdOn).toString(),
            new Date(testComponent.createdOn).toString(),
          );
          assert(createdBy);
          assert.strictEqual(createdBy.username, testUser.username);
          assert.strictEqual(createdBy.displayName, testUser.displayName);
          assert(updatedOn);
          assert(updatedBy);
          assert.strictEqual(updatedBy.username, testUser.username);
          assert.strictEqual(updatedBy.displayName, testUser.displayName);
          assert.strictEqual(version, testComponent.version + 1);

          let componentVersion: ComponentVersionInstance;
          try {
            componentVersion = await ComponentVersion.findOne({
              componentId: testComponent._id,
              version: testComponent.version,
            }).exec();
          } catch (err) {
            return done(err);
          }

          assert(componentVersion);
          assert.deepStrictEqual(componentVersion.content, testComponent.content);
          done();
        });
    });
  });
});
