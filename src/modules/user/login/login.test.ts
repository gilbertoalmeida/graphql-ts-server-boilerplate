import { invalidLogin, confirmEmailMessage } from "./errorMessages";
import { User } from "../../../entity/User";
import { Connection } from "typeorm";
import { TestClient } from "../../../Utils/TestClient";
import { createTestConnection } from "../../../testUtils/createTestConnection";

const email = "login@test.com";
const password = "jalksdf";

let conn: Connection;

beforeAll(async () => {
  conn = await createTestConnection();
});

afterAll(async () => {
  conn.close();
});

const loginTryWithMessage = async (
  client: TestClient,
  e: string,
  p: string,
  errMsg: string
) => {
  const response = await client.login(e, p);

  expect(response.data).toEqual({
    login: [
      {
        path: "email",
        message: errMsg
      }
    ]
  });
};

describe("login", () => {
  /* I unified the tests like Ben did, bc they were failing with errors that
  didn't make any sense. For example having expects from one test on the other.
  And I couldn't solve it (maybe it's a jest problem). If I want to look further
  into this in the future, my divided tests are commented on the bottom */
  test("email not found send back error", async () => {
    const client = new TestClient(process.env.TEST_HOST as string);
    await loginTryWithMessage(client, "bob@bob.com", "whatever", invalidLogin);
  });

  test("email not confirmed", async () => {
    const client = new TestClient(process.env.TEST_HOST as string);
    await client.register(email, password);

    await loginTryWithMessage(client, email, password, confirmEmailMessage);

    await User.update({ email }, { confirmed: true });

    await loginTryWithMessage(client, email, "afthsdft5w4w45", invalidLogin);

    const response = await client.login(email, password);

    expect(response.data).toEqual({ login: null });
  });
});

/* 
  test("massage for failed login due to email not in the database", async () => {
    const client = new TestClient(process.env.TEST_HOST as string);

    loginTryWithMessage(client, email, password, invalidLogin);
  });

  test("message for email not confirmed", async () => {
    const client = new TestClient(process.env.TEST_HOST as string);

    await client.register(email, password);

    loginTryWithMessage(client, email, password, confirmEmailMessage);
  });

  test("bad password message", async () => {
    const client = new TestClient(process.env.TEST_HOST as string);

    await User.update({ email }, { confirmed: true });

    loginTryWithMessage(client, email, "sd", invalidLogin);
  });

  test("login in with confirmed email", async () => {
    const client = new TestClient(process.env.TEST_HOST as string);

    const response = await client.login(email, password);

    expect(response.data).toEqual({
      login: null
    });
  }); */
