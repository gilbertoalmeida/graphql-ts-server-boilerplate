import * as nodemailer from "nodemailer";

export const sendEmail = async (recipient: string, url: string) => {
  /* FOR PRODUCTION, you just have to put the SMTP settings of a real
  email provider here.
  For example: for gmail the host is smtp.gmail.com, port is 587 and you can store 
  the user and password in the .env file and import them here. 
  BUT USE A EMAIL JUST FOR THIS FOR SAFETY.
  I also enabled access through less secure apps, otherwise gmail doesn't let ethereal
  do the login 
  to change this config, go to:
  https://myaccount.google.com/lesssecureapps?pli=1 
  */
  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
      user: "arnoldo.rodriguez52@ethereal.email",
      pass: "9M9sS57tn5ExfzPkmY"
    }
  });

  // Message object
  const message = {
    from: "Sender Name <sender@example.com>",
    to: `Recipient <${recipient}>`,
    subject: "Nodemailer is unicode friendly ✔",
    html: `<html><body>
      <p>Click on the link below to confirm your email</p>
      <a href="${url}">Confirm</a>
      </body></html>`
  };

  transporter.sendMail(message, (err, info) => {
    if (err) {
      console.log("Error occurred. " + err.message);
    }

    console.log("Message sent: %s", info.messageId);
    // Preview only available when sending through an Ethereal account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  });
};
