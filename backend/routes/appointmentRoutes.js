import express from 'express';
import pool from '../config/db.js';
import nodemailer from 'nodemailer'; // for email notifications
import  generateGoogleMeetLink  from '../utils/meet.js'; // a utility function for generating Google Meet links

const router = express.Router();

// Setup nodemailer for email notifications
const transporter = nodemailer.createTransport({
    service: 'gmail', // or other email service provider
    auth: {
        user: 'your-email@gmail.com', // replace with your email
        pass: 'your-email-password' // replace with your email password
    }
});

// Fetch Appointments for a Doctor
router.get('/doctor/:doctorId', async (req, res) => {
    const { doctorId } = req.params;

    try {
        const [appointments] = await pool.query('SELECT * FROM appointments WHERE DoctorID = ?', [doctorId]);
        return res.status(200).json({ appointments });
    } catch (error) {
        console.error('Error fetching appointments:', error);
        return res.status(500).json({ message: 'Unable to fetch appointments at this time.' });
    }
});

// Fetch Appointments for a Patient
router.get('/patient/:patientId', async (req, res) => {
    const { patientId } = req.params;

    try {
        const [appointments] = await pool.query('SELECT * FROM appointments WHERE PatientID = ?', [patientId]);
        return res.status(200).json({ appointments });
    } catch (error) {
        console.error('Error fetching patient appointments:', error);
        return res.status(500).json({ message: 'Unable to fetch patient appointments at this time.' });
    }
});

// Book Appointment Route
router.post('/book', async (req, res) => {
    const { doctorId, patientId, date, time, patientEmail } = req.body; 

    if (!doctorId || !patientId || !date || !time || !patientEmail) {
        return res.status(400).json({ message: 'All fields are required, including patient email.' });
    }

    try {
        // Check if the timeslot is available
        const [existingAppointments] = await pool.query(
            'SELECT * FROM appointments WHERE DoctorID = ? AND AppointmentDate = ? AND AppointmentTime = ? AND Status = "booked"',
            [doctorId, date, time]
        );

        if (existingAppointments.length > 0) {
            return res.status(400).json({ message: 'Timeslot is already booked.' });
        }

        // Generate Google Meet link
        const googleMeetLink = generateGoogleMeetLink();

        // Insert the appointment
        const [result] = await pool.query(
            'INSERT INTO appointments (DoctorID, PatientID, AppointmentDate, AppointmentTime, Status, MeetLink) VALUES (?, ?, ?, ?, "booked", ?)',
            [doctorId, patientId, date, time, googleMeetLink]
        );

        if (result.affectedRows === 0) {
            return res.status(500).json({ message: 'Failed to book the appointment.' });
        }

        // Send an email notification with the Google Meet link
        const mailOptions = {
            from: 'your-email@gmail.com',
            to: patientEmail, // Send email to the provided patient email
            subject: 'Appointment Confirmation',
            text: `Your appointment is confirmed. Here is your Google Meet link: ${googleMeetLink}`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                // Do not return an error response here since the booking succeeded
            } else {
                console.log('Email sent:', info.response);
            }
        });

        return res.status(200).json({ message: 'Appointment booked successfully.' });
    } catch (error) {
        console.error('Error booking appointment:', error);
        return res.status(500).json({ message: 'Server error while booking appointment.' });
    }
});

// Update Appointment Status
router.put('/:appointmentId', async (req, res) => {
    const { appointmentId } = req.params;
    const { status } = req.body;

    if (!['accepted', 'declined'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status value.' });
    }

    try {
        const [result] = await pool.query('UPDATE appointments SET Status = ? WHERE AppointmentID = ?', [status, appointmentId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Appointment not found.' });
        }
        return res.status(200).json({ message: 'Appointment status updated successfully.' });
    } catch (error) {
        console.error('Error updating appointment status:', error);
        return res.status(500).json({ message: 'Server error while updating appointment status.' });
    }
});

export default router;
