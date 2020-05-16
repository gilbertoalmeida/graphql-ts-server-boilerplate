import { User } from "../../entity/User";
import {
  duplicateEmail,
  emailNotLongEnough,
  emailNotValid,
  passwordNotLongEnough
} from "./errorMessages";
import { createTypeormConnection } from "../../Utils/createTypeormConnection";
import { Connection } from "typeorm";
import { TestClient } from "../../Utils/TestClient";

const email = "testuser@test.com";
const password = "jalksdf";

let conn: Connection;

beforeAll(async () => {
  conn = await createTypeormConnection();
});

afterAll(async () => {
  conn.close();
});

describe("Register user", () => {
  test("Registering one user", async () => {
    const client = new TestClient(process.env.TEST_HOST as string);

    const response = await client.register(email, password);

    /* test part */
    expect(response.data).toEqual({ register: null });
    const users = await User.find({ where: { email } });
    expect(users).toHaveLength(1);
    const user = users[0];
    expect(user.email).toEqual(email);
    expect(user.password).not.toEqual(password);
  });

  test("Failing to register the same email", async () => {
    const client = new TestClient(process.env.TEST_HOST as string);

    const response2 = await client.register(email, password);

    expect(response2.data.register).toHaveLength(1);
    expect(response2.data.register[0]).toEqual({
      path: "email",
      message: duplicateEmail
    });
  });

  test("Catch short and not valid email", async () => {
    const client = new TestClient(process.env.TEST_HOST as string);

    const response3 = await client.register("b", password);

    expect(response3.data).toEqual({
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
    const client = new TestClient(process.env.TEST_HOST as string);

    const response4 = await client.register(email, "fd");
    expect(response4.data).toEqual({
      register: [
        {
          path: "password",
          message: passwordNotLongEnough
        }
      ]
    });
  });

  test("Catch bad password and bad email", async () => {
    const client = new TestClient(process.env.TEST_HOST as string);

    const response5 = await client.register("bf", "gd");

    expect(response5.data).toEqual({
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
