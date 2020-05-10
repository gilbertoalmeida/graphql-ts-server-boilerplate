import { request } from "graphql-request";
import { User } from "../../entity/User";
import {
  duplicateEmail,
  emailNotLongEnough,
  emailNotValid,
  passwordNotLongEnough
} from "./errorMessages";
import { createTypeormConnection } from "../../Utils/createTypeormConnection";
import { Connection } from "typeorm";

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

let conn: Connection;

beforeAll(async () => {
  conn = await createTypeormConnection();
});

afterAll(async () => {
  conn.close();
});

describe("Register user", () => {
  test("Registering one user", async () => {
    /* graphql-requests takes the host address of the server (this is comming from the setup funtion of the tests in
      testSetup. The funstion runs before all test files). This host address is different in test then in development, btw
    see index.ts)*/

    /* using as string bc process.env things could be undefined, and we are trusting they won't */
    const response = await request(
      process.env.TEST_HOST as string,
      mutation(email, password)
    );

    /* test part */
    expect(response).toEqual({ register: null });
    const users = await User.find({ where: { email } });
    expect(users).toHaveLength(1);
    const user = users[0];
    expect(user.email).toEqual(email);
    expect(user.password).not.toEqual(password);
  });

  test("Failing to register the same email", async () => {
    const response2: any = await request(
      process.env.TEST_HOST as string,
      mutation(email, password)
    );
    expect(response2.register).toHaveLength(1);
    expect(response2.register[0]).toEqual({
      path: "email",
      message: duplicateEmail
    });
  });

  test("Catch short and not valid email", async () => {
    const response3: any = await request(
      process.env.TEST_HOST as string,
      mutation("b", password)
    );
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
    const response4: any = await request(
      process.env.TEST_HOST as string,
      mutation(email, "fd")
    );
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
    const response5: any = await request(
      process.env.TEST_HOST as string,
      mutation("bf", "gd")
    );
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
