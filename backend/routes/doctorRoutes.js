import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

// Fetch Psychologist Details by Name
router.get('/:name', async (req, res) => {
    const psychologistName = req.params.name;

    try {
        const [rows] = await pool.query('SELECT * FROM doc WHERE Name = ?', [psychologistName]);
        if (rows.length > 0) {
            return res.status(200).json(rows[0]);
        } else {
            return res.status(404).json({ message: 'Psychologist not found.' });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Server error while fetching psychologist details.' });
    }
});

export default router;
