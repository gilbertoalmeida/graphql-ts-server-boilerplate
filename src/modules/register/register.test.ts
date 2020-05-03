import { request } from "graphql-request";
import { User } from "../../entity/User";
import { startServer } from "../../startServer";
import { AddressInfo } from "net";
import {
  duplicateEmail,
  emailNotLongEnough,
  emailNotValid,
  passwordNotLongEnough
} from "./errorMessages";

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

const mutation = (e: string, p: string) => `
mutation {
  register(email: "${e}", password: "${p}") {
    path
    message
  }
}
`;

describe("Register user", () => {
  test("Registering one user", async () => {
    /* graphql-requests takes the host address of the server 
  (which in test is different then in development, btw
    see index.ts) and the mutation or query that you 
    want to run*/
    const response = await request(getHost, mutation(email, password));

    /* test part */
    expect(response).toEqual({ register: null });
    const users = await User.find({ where: { email } });
    expect(users).toHaveLength(1);
    const user = users[0];
    expect(user.email).toEqual(email);
    expect(user.password).not.toEqual(password);
  });

  test("Failing to register the same email", async () => {
    const response2: any = await request(getHost, mutation(email, password));
    expect(response2.register).toHaveLength(1);
    expect(response2.register[0]).toEqual({
      path: "email",
      message: duplicateEmail
    });
  });

  test("Catch short and not valid email", async () => {
    const response3: any = await request(getHost, mutation("b", password));
    expect(response3).toEqual({
      register: [
        {
          path: "email",
          message: emailNotLongEnough
        },
        {
          path: "email",
          message: emailNotValid
        }
      ]
    });
  });

  test("Catch bad password", async () => {
    const response4: any = await request(getHost, mutation(email, "fd"));
    expect(response4).toEqual({
      register: [
        {
          path: "password",
          message: passwordNotLongEnough
        }
      ]
    });
  });

  test("Catch bad password and bad email", async () => {
    const response5: any = await request(getHost, mutation("bf", "gd"));
    expect(response5).toEqual({
      register: [
        {
          path: "email",
          message: emailNotLongEnough
        },
        {
          path: "email",
          message: emailNotValid
        },
        {
          path: "password",
          message: passwordNotLongEnough
        }
      ]
    });
  });
});

/* 
Interface AddressInfo {
    address: string;
    family: string;
    port: number;
} 
*/
