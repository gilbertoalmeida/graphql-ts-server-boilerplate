import { request } from "graphql-request";
import { host } from "./constants";
import { User } from "../entity/User";
import { createTypeormConnection } from "../Utils/createTypeormConnection";
import { Connection } from "typeorm";

let connection: Connection;

/* helper function from jest. Runs before all test. There's also one
afterAll, beforeEach and afterEach */
beforeAll(async () => {
  connection = await createTypeormConnection();
  /* the database is being called empty in this test environment, bc
  its ormconfig has a dropSchema set to true */
});

const email = "testuser@test.com";
const password = "jalksdf";

const mutation = `
mutation {
  register(email: "${email}", password: "${password}")
}
`;

test("Register user", async () => {
  /* graphql-requests takes the host address of the server
   and the mutation or query that you want to run*/
  const response = await request(host, mutation);
  /* test part */

  expect(response).toEqual({ register: true });
  const users = await User.find({ where: { email } });
  expect(users).toHaveLength(1);
  const user = users[0];
  expect(user.email).toEqual(email);
  expect(user.password).not.toEqual(password);
});

afterAll(async () => {
  await connection.close();
});

/* ADD A TEST TO DELETE THIS TEST USER */
/* Test in another database */
/* run the server hier directly */
