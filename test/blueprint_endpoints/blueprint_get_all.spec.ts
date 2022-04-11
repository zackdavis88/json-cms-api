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
} from '../utils';
import request from 'supertest';
const apiRoute = '/blueprints';
const serverUrl = getServerUrl();

describe('[Blueprint] Get All', () => {
  describe(`GET ${apiRoute}`, () => {
    let connection: Connection;
    let testUser: UserInstance;
    let authToken: string;

    beforeAll(async () => {
      connection = await connectDatabase();
      if (!connection) return 'could not connect to db';

      testUser = await createTestUser('Password1');
      authToken = generateToken(testUser);
      await createTestBlueprint(testUser);
      await createTestBlueprint(testUser);
      await createTestBlueprint(testUser);
      await createTestBlueprint(testUser);
      await createTestBlueprint(testUser);
      await createTestBlueprint(testUser);
      await createTestBlueprint(testUser);
      await createTestBlueprint(testUser);
      await createTestBlueprint(testUser);
      await createTestBlueprint(testUser);
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

    it('should successfully return a list of blueprints', (done) => {
      request(serverUrl)
        .get(`${apiRoute}?itemsPerPage=2&page=3`)
        .set('x-auth-token', authToken)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);

          const { message, blueprints, page, itemsPerPage, totalPages, totalItems } =
            res.body;
          assert.strictEqual(message, 'blueprint list has been successfully retrieved');
          assert.strictEqual(page, 3);
          assert.strictEqual(itemsPerPage, 2);
          assert(totalPages >= 5);
          assert(totalItems >= 10);
          assert(blueprints);
          assert(blueprints.length);
          const { id, name, createdOn, createdBy } = blueprints[0];
          assert(id);
          assert(name);
          assert(createdOn);
          const { username, displayName } = createdBy;
          assert(username);
          assert(displayName);
          done();
        });
    });
  });
});
