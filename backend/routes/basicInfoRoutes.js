// routes/basicInfoRoutes.js
import express from 'express';
import pool from '../config/db.js';
const router = express.Router();

router.post('/info', async (req, res) => {
    const { user_id, username, email, first_name, last_name, phone_number, gender, date_of_birth, profile_photo_url } = req.body;
    try {
        await pool.query(
            `INSERT INTO basic_information (user_id, username, email, first_name, last_name, phone_number, gender, date_of_birth, profile_photo_url) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) 
             ON DUPLICATE KEY UPDATE username = VALUES(username), email = VALUES(email), first_name = VALUES(first_name), last_name = VALUES(last_name), 
             phone_number = VALUES(phone_number), gender = VALUES(gender), date_of_birth = VALUES(date_of_birth), profile_photo_url = VALUES(profile_photo_url)`,
            [user_id, username, email, first_name, last_name, phone_number, gender, date_of_birth, profile_photo_url]
        );
        res.json({ message: 'Basic information saved successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to save basic information' });
    }
});

export default router;
