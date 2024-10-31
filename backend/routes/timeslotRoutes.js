import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

router.get('/timeslots/:doctorId/:date', async (req, res) => {
    const { doctorId, date } = req.params;

    try {
        const [timeslots] = await pool.query(
            'SELECT * FROM timeslots WHERE doctor_id = ? AND date = ? AND status = "available"',
            [doctorId, date]
        );
        res.status(200).json({ timeslots });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching available timeslots.' });
    }
});

export default router;
