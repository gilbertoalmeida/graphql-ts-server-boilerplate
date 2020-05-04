import fetch from "node-fetch";

test("Sends invalid back if bad id sent", async () => {
  const response = await fetch(`${process.env.TEST_HOST}/confirm/86dsfg6a9dg`);
  const text = await response.text();
  expect(text).toEqual("invalid");
});
