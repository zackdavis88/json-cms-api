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
  createTestLayout,
  LayoutInstance,
  ComponentInstance,
} from '../utils';
import request from 'supertest';
let apiRoute = '/layouts/:layoutId';
const serverUrl = getServerUrl();

describe('[Layout] Get One', () => {
  describe(`GET ${apiRoute}`, () => {
    let connection: Connection;
    let testUser: UserInstance;
    let authToken: string;
    let testLayout: LayoutInstance;
    let testComponent1: ComponentInstance;
    let testComponent2: ComponentInstance;
    let testComponent3: ComponentInstance;

    beforeAll(async () => {
      connection = await connectDatabase();
      if (!connection) return 'could not connect to db';

      testUser = await createTestUser('Password1');
      authToken = generateToken(testUser);
      const testBlueprint = await createTestBlueprint(testUser);
      testComponent1 = await createTestComponent(testUser, testBlueprint);
      testComponent2 = await createTestComponent(testUser, testBlueprint);
      testComponent3 = await createTestComponent(testUser, testBlueprint);
      const layoutComponents = [
        testComponent1,
        testComponent1,
        testComponent2,
        testComponent3,
        testComponent3,
      ];
      testLayout = await createTestLayout(testUser, layoutComponents);
    });

    afterAll(async () => {
      await cleanupTestRecords();
      await connection.close();
    });

    beforeEach(() => {
      apiRoute = `/layouts/${testLayout._id}`;
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

    it('should reject requests when the layoutId is invalid', (done) => {
      apiRoute = '/layouts/bad';
      request(serverUrl).get(apiRoute).set('x-auth-token', authToken).expect(
        400,
        {
          error: 'layoutId is not valid',
        },
        done,
      );
    });

    it('should reject requests when the requested layout is not found', (done) => {
      apiRoute = '/layouts/impo$$ibleId';
      request(serverUrl).get(apiRoute).set('x-auth-token', authToken).expect(
        404,
        {
          error: 'requested layout not found',
        },
        done,
      );
    });

    it('should successfully return layout details', (done) => {
      request(serverUrl)
        .get(`${apiRoute}?itemsPerPage=1&page=3`)
        .set('x-auth-token', authToken)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);

          const { message, layout } = res.body;
          assert.strictEqual(message, 'layout has been successfully retrieved');
          assert(layout);
          const { id, name, components, createdOn, createdBy } = layout;
          assert.strictEqual(id, testLayout.id);
          assert.strictEqual(name, testLayout.name);
          assert.strictEqual(
            new Date(createdOn).toString(),
            new Date(testLayout.createdOn).toString(),
          );
          assert(createdBy);
          assert(createdBy.username, testUser.username);
          assert(createdBy.displayName, testUser.displayName);
          assert(components);
          assert(Array.isArray(components));
          assert.strictEqual(components.length, 5);

          const [item1, item2, item3, item4, item5] = components;
          assert.strictEqual(item1.id, testComponent1.id);
          assert.strictEqual(item1.name, testComponent1.name);
          assert.deepStrictEqual(item1.content, testComponent1.content);
          assert.strictEqual(item1.version, testComponent1.version);

          assert.strictEqual(item2.id, testComponent1.id);
          assert.strictEqual(item2.name, testComponent1.name);
          assert.deepStrictEqual(item2.content, testComponent1.content);
          assert.strictEqual(item2.version, testComponent1.version);

          assert.strictEqual(item3.id, testComponent2.id);
          assert.strictEqual(item3.name, testComponent2.name);
          assert.deepStrictEqual(item3.content, testComponent2.content);
          assert.strictEqual(item3.version, testComponent2.version);

          assert.strictEqual(item4.id, testComponent3.id);
          assert.strictEqual(item4.name, testComponent3.name);
          assert.deepStrictEqual(item4.content, testComponent3.content);
          assert.strictEqual(item4.version, testComponent3.version);

          assert.strictEqual(item5.id, testComponent3.id);
          assert.strictEqual(item5.name, testComponent3.name);
          assert.deepStrictEqual(item5.content, testComponent3.content);
          assert.strictEqual(item5.version, testComponent3.version);
          done();
        });
    });
  });
});
