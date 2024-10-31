// routes/educationRoutes.js
import express from 'express';
import pool from '../config/db.js';
const router = express.Router();

router.post('/edu', async (req, res) => {
    const { user_id, degree, college_institute, year_of_completion } = req.body;
    try {
        await pool.query(
            `INSERT INTO education (user_id, degree, college_institute, year_of_completion) 
             VALUES (?, ?, ?, ?) 
             ON DUPLICATE KEY UPDATE degree = VALUES(degree), college_institute = VALUES(college_institute), year_of_completion = VALUES(year_of_completion)`,
            [user_id, degree, college_institute, year_of_completion]
        );
        res.json({ message: 'Education information saved successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to save education information' });
    }
});

export default router;
