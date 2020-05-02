import { request } from "graphql-request";
import { createConnection } from "typeorm";

import { host } from "./constants";
import { User } from "../entity/User";

const email = "testuser3@test.com";
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
  const connection = await createConnection();
  const users = await User.find({ where: { email } });
  expect(users).toHaveLength(1);
  const user = users[0];
  expect(user.email).toEqual(email);
  expect(user.password).not.toEqual(password);

  connection.close();
});

/* ADD A TEST TO DELETE THIS TEST USER */
/* Test in another database */
/* run the server hier directly */
