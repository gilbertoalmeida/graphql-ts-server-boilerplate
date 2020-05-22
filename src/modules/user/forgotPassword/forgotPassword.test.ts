import { User } from "../../../entity/User";
import { Connection } from "typeorm";
import { TestClient } from "../../../Utils/TestClient";
import { createForgotPasswordLink } from "../../../Utils/createForgotPasswordLink";
import * as Redis from "ioredis";
import { forgotPasswordLockAccount } from "../../../Utils/forgotPasswordLockAccount";
import { forgotPasswordLockedError } from "../login/errorMessages";
import { passwordNotLongEnough } from "../register/errorMessages";
import { expiredChangePasswordKeyError } from "./errorMessages";
import { createTestConnection } from "../../../testUtils/createTestConnection";

let userId: string;
let conn: Connection;
const redis = new Redis();
const email = "forgotpassword@test.com";
const password = "asga346t3";
const newPassword = "wrthsdb2346sd";

beforeAll(async () => {
  conn = await createTestConnection();
  const user = await User.create({
    email,
    password,
    confirmed: true
  }).save();
  userId = user.id;
});

afterAll(async () => {
  conn.close();
});

describe("forgot password", () => {
  test("", async () => {
    const client = new TestClient(process.env.TEST_HOST as string);

    /* lock the account */
    await forgotPasswordLockAccount(userId, redis);

    const url = await createForgotPasswordLink("", userId, redis);
    const parts = url.split("/");
    const key = parts[parts.length - 1];

    /* making sure you cannot login anymore */
    expect(await client.login(email, password)).toEqual({
      data: {
        login: [
          {
            path: "email",
            message: forgotPasswordLockedError
          }
        ]
      }
    });

    /* try to change the password with a short password */
    expect(await client.forgotPasswordChange("2", key)).toEqual({
      data: {
        forgotPasswordChange: [
          {
            path: "newPassword",
            message: passwordNotLongEnough
          }
        ]
      }
    });

    /* successful change*/
    const response = await client.forgotPasswordChange(newPassword, key);

    expect(response.data).toEqual({
      forgotPasswordChange: null
    });

    /* trying to change the password again. Making sure redis expires
    the key */
    expect(await client.forgotPasswordChange("agaarv242wfr4f", key)).toEqual({
      data: {
        forgotPasswordChange: [
          {
            path: "key",
            message: expiredChangePasswordKeyError
          }
        ]
      }
    });

    /* now the account is unlocked and you can login with the new password */
    expect(await client.login(email, newPassword)).toEqual({
      data: {
        login: null
      }
    });
  });
});
