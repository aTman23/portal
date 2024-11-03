import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
   service: 'gmail',
   auth: {
       user: process.env.Email,
       pass: process.env.Password
   }
});

export default async function sendEmailNotification(patientId, doctorId, date, time, meetLink) {
   const mailOptions = {
       from: process.env.EMAIL_USER,
       to: 'patient_email@example.com', 
       subject: 'Appointment Confirmation',
       text: `Your appointment is confirmed for ${date} at ${time}. Join via Google Meet: ${meetLink}`
   };

   await transporter.sendMail(mailOptions);
}
