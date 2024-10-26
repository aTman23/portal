import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

// Fetch Appointments for a Doctor
router.get('/doctor/:doctorId', async (req, res) => {
    const { doctorId } = req.params;

    try {
        const [appointments] = await pool.query('SELECT * FROM appointments WHERE DoctorID = ?', [doctorId]);
        return res.status(200).json({ appointments });
    } catch (error) {
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
        return res.status(500).json({ message: 'Unable to fetch patient appointments at this time.' });
    }
});

// Book Appointment Route
router.post('/book', async (req, res) => {
    const { doctorId, patientId, date, time } = req.body;

    if (!doctorId || !patientId || !date || !time) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        await pool.query('INSERT INTO appointments (DoctorID, PatientID, AppointmentDate, AppointmentTime) VALUES (?, ?, ?, ?)', [doctorId, patientId, date, time]);
        return res.status(200).json({ message: 'Appointment booked successfully.' });
    } catch (error) {
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
        await pool.query('UPDATE appointments SET Status = ? WHERE AppointmentID = ?', [status, appointmentId]);
        return res.status(200).json({ message: 'Appointment status updated successfully.' });
    } catch (error) {
        return res.status(500).json({ message: 'Server error while updating appointment status.' });
    }
});

export default router;
