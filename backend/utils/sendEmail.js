import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  // Create a transporter using Gmail SMTP
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_EMAIL,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  // Define email options
  const mailOptions = {
    from: `Odontogenic LMS <${process.env.GMAIL_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html, // Support for HTML formatting
  };

  // Send email
  await transporter.sendMail(mailOptions);
};

export default sendEmail;
