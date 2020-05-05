import { request } from "graphql-request";
import { invalidLogin, confirmEmailMessage } from "./errorMessages";
import { createTypeormConnection } from "../../Utils/createTypeormConnection";
import { User } from "../../entity/User";

const email = "testuser@test.com";
const password = "jalksdf";

const registerMutation = (e: string, p: string) => `
mutation {
  register(email: "${e}", password: "${p}") {
    path
    message
  }
}
`;

const loginMutation = (e: string, p: string) => `
mutation {
  login(email: "${e}", password: "${p}") {
    path
    message
  }
}
`;

const loginTryWithMessage = async (e: string, p: string, errMsg: string) => {
  const response = await request(
    process.env.TEST_HOST as string,
    loginMutation(e, p)
  );

  expect(response).toEqual({
    login: [
      {
        path: "email",
        message: errMsg
      }
    ]
  });
};

beforeAll(async () => {
  await createTypeormConnection();
});

describe("login", () => {
  test("massage for failed login due to email not in the database", async () => {
    loginTryWithMessage(email, password, invalidLogin);
  });

  test("message for email not confirmed", async () => {
    await request(
      process.env.TEST_HOST as string,
      registerMutation(email, password)
    );

    loginTryWithMessage(email, password, confirmEmailMessage);
  });

  test("bad password message", async () => {
    await User.update({ email }, { confirmed: true });

    loginTryWithMessage(email, "sd", invalidLogin);
  });

  test("login in with confirmed email", async () => {
    const response = await request(
      process.env.TEST_HOST as string,
      loginMutation(email, password)
    );

    expect(response).toEqual({
      login: null
    });
  });
});
