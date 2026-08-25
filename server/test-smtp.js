import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'qlgod991@gmail.com',
    pass: 'pgxeklmpqwwppctt'
  }
});

transporter.verify(function(error, success) {
  if (error) {
    console.error('SMTP Connection Error:', error);
    process.exit(1);
  } else {
    console.log('SMTP Connection Success:', success);
    process.exit(0);
  }
});
