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
import { ComponentVersion, ComponentVersionInstance } from '../../src/models';
let apiRoute = '/components/:componentId';
const serverUrl = getServerUrl();

describe('[Component] Remove', () => {
  describe(`DELETE ${apiRoute}`, () => {
    let connection: Connection;
    let testUser: UserInstance;
    let testBlueprint: BlueprintInstance;
    let authToken: string;
    let testComponent: ComponentInstance;
    let payload: {
      confirm?: unknown;
    };

    beforeAll(async () => {
      connection = await connectDatabase();
      if (!connection) return 'could not connect to db';

      testUser = await createTestUser('Password1');
      testBlueprint = await createTestBlueprint(testUser);
      authToken = generateToken(testUser);
      testComponent = await createTestComponent(testUser, testBlueprint);
    });

    afterAll(async () => {
      await cleanupTestRecords();
      await connection.close();
    });

    beforeEach(() => {
      apiRoute = `/components/${testComponent._id}`;
      payload = { confirm: testComponent.name };
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

    it('should reject requests when the componentId is invalid', (done) => {
      apiRoute = '/components/a';
      request(serverUrl).delete(apiRoute).set('x-auth-token', authToken).expect(
        400,
        {
          error: 'componentId is not valid',
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
      payload.confirm = 'NotTheRightComponentName';
      request(serverUrl)
        .delete(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'confirm input must match the component name',
          },
          done,
        );
    });

    it('should successfully remove a component', (done) => {
      request(serverUrl)
        .delete(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(200)
        .end(async (err, res) => {
          if (err) return done(err);

          const { message, component } = res.body;

          assert.strictEqual(message, 'component has been successfully removed');
          assert(component);
          assert.strictEqual(component.id, testComponent.id);
          assert.strictEqual(component.isActive, false);
          assert.strictEqual(component.name, testComponent.name);
          assert.strictEqual(
            new Date(component.createdOn).toString(),
            new Date(testComponent.createdOn).toString(),
          );
          assert(component.createdBy);
          assert.strictEqual(component.createdBy.username, testUser.username);
          assert.strictEqual(component.createdBy.displayName, testUser.displayName);

          assert(component.deletedOn);
          assert(component.deletedBy);
          assert.strictEqual(component.deletedBy.username, testUser.username);
          assert.strictEqual(component.deletedBy.displayName, testUser.displayName);

          let componentVersion: ComponentVersionInstance;
          try {
            componentVersion = await ComponentVersion.findOne({
              componentId: testComponent._id,
              version: testComponent.version,
            }).exec();
          } catch (err) {
            return done(err);
          }

          assert.deepStrictEqual(
            componentVersion.toObject().content,
            testComponent.toObject().content,
          );
          done();
        });
    });
  });
});
