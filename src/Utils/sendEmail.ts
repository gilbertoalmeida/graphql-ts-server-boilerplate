import * as SparkPost from "sparkpost";
const client = new SparkPost(process.env.SPARKPOST_API_KEY);

export const sendEmail = async (recipient: string, url: string) => {
  const response = await client.transmissions.send({
    options: {
      sandbox: true
    },
    content: {
      from: "testing@sparkpostbox.com",
      subject: "Confirm Email",
      html: `<html><body>
        <p>Click on the link below to confirm your email</p>
        <a href="${url}">Confirm</a>
        </body></html>`
    },
    recipients: [{ address: recipient }]
  });
  console.log(response);
};
