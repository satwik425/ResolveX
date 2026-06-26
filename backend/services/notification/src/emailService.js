const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS   // use Gmail app password
  }
});

const sendEmail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: `"YourApp" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html
  });
  console.log(`Email sent to ${to}`);
};

module.exports = { sendEmail };