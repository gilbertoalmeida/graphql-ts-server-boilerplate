import { request } from "graphql-request";
import { User } from "../../entity/User";
import { startServer } from "../../startServer";
import { AddressInfo } from "net";

let getHost = "";

/* helper function from jest. Runs before all test. There's also one
afterAll, beforeEach and afterEach */
beforeAll(async () => {
  const app = await startServer();

  /* AddressInfo is an interface for assigning types, see bottom of
  this file for how it looks like */
  const { port } = app.address() as AddressInfo;
  getHost = `http://127.0.0.1:${port}`;
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
  (which in test is different then in development, btw
    see index.ts) and the mutation or query that you 
    want to run*/
  const response = await request(getHost, mutation);

  /* test part */
  expect(response).toEqual({ register: true });
  const users = await User.find({ where: { email } });
  expect(users).toHaveLength(1);
  const user = users[0];
  expect(user.email).toEqual(email);
  expect(user.password).not.toEqual(password);
});

/* 
Interface AddressInfo {
    address: string;
    family: string;
    port: number;
} 
*/
