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
} from '../utils';
import request from 'supertest';
const apiRoute = '/layouts';
const serverUrl = getServerUrl();

describe('[Layout] Get All', () => {
  describe(`GET ${apiRoute}`, () => {
    let connection: Connection;
    let testUser: UserInstance;
    let authToken: string;

    beforeAll(async () => {
      connection = await connectDatabase();
      if (!connection) return 'could not connect to db';

      testUser = await createTestUser('Password1');
      authToken = generateToken(testUser);
      const testBlueprint = await createTestBlueprint(testUser);
      const component1 = await createTestComponent(testUser, testBlueprint);
      const component2 = await createTestComponent(testUser, testBlueprint);
      const component3 = await createTestComponent(testUser, testBlueprint);
      const component4 = await createTestComponent(testUser, testBlueprint);
      const component5 = await createTestComponent(testUser, testBlueprint);
      const component6 = await createTestComponent(testUser, testBlueprint);
      const component7 = await createTestComponent(testUser, testBlueprint);
      const component8 = await createTestComponent(testUser, testBlueprint);
      const component9 = await createTestComponent(testUser, testBlueprint);
      const component10 = await createTestComponent(testUser, testBlueprint);

      const layoutComponents1 = [component1, component2, component3];
      const layoutComponents2 = [component4, component5, component6];
      const layoutComponents3 = [component7, component8, component9, component10];

      await createTestLayout(testUser, layoutComponents1);
      await createTestLayout(testUser, layoutComponents2);
      await createTestLayout(testUser, layoutComponents3);
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
        .get(`${apiRoute}?itemsPerPage=1&page=3`)
        .set('x-auth-token', authToken)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);

          const { message, layouts, page, itemsPerPage, totalPages, totalItems } =
            res.body;
          assert.strictEqual(message, 'layout list has been successfully retrieved');
          assert.strictEqual(page, 3);
          assert.strictEqual(itemsPerPage, 1);
          assert.strictEqual(totalPages >= 3, true);
          assert.strictEqual(totalItems >= 3, true);
          assert(layouts);
          assert(Array.isArray(layouts));

          const { name, createdOn, createdBy } = layouts[0];
          assert(name);
          assert(createdOn);
          assert(createdBy);
          assert(createdBy.username);
          assert(createdBy.displayName);
          done();
        });
    });
  });
});
