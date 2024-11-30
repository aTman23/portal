// routes/experienceRoutes.js
import express from 'express';
import pool from '../config/db.js';
const router = express.Router();

router.post('/exp', async (req, res) => {
    const { user_id, hospital_name, from_date, to_date, designation } = req.body;
    try {
        await pool.query(
            `INSERT INTO experience (user_id, hospital_name, from_date, to_date, designation) 
             VALUES (?, ?, ?, ?, ?) 
             ON DUPLICATE KEY UPDATE hospital_name = VALUES(hospital_name), from_date = VALUES(from_date), to_date = VALUES(to_date), designation = VALUES(designation)`,
            [user_id, hospital_name, from_date, to_date, designation]
        );
        res.json({ message: 'Experience information saved successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to save experience information' });
    }
});

export default router;
