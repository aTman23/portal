import express from 'express';
import sendEmailNotification from '../utils/email.js';

const router = express.Router();

router.post('/notify', async (req, res) => {
    const { patientId, doctorId, date, time, meetLink } = req.body;

    try {
        await sendEmailNotification(patientId, doctorId, date, time, meetLink);
        res.status(200).json({ message: 'Email notification sent successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Error sending email notification.' });
    }
});

export default router;
