import nodemailer from 'nodemailer';
import config from '../config';

export const sendMail = async (to: string, html: string) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: config.NODE_ENV === 'production', // Use `true` for port 465, `false` for all other ports
    auth: {
      user: 'md.srsihabzone@gmail.com',
      pass: 'unqn eyqd drsb mfzx',
    },
  });

  await transporter.sendMail({
    from: '"SR Tech" <md.srsihabzone@gmail.com>', // sender address
    to: `${to}`, // list of receivers
    subject: 'Reset Password Link', // Subject line
    html: `Hello Dear user, Your Reset Password Link Expire in 10 minutes, <b>${html}</b>`, // html body
  });
};
