import express from 'express';
import pool from '../config/db.js';
const router = express.Router();

router.post('/edu', async (req, res) => {
    const { UserID, educationRecords } = req.body;  // Expecting an array of education records
    
    // Validation to check if educationRecords is an array and is not empty
    if (!Array.isArray(educationRecords) || educationRecords.length === 0) {
        return res.status(400).json({ error: 'Education records must be an array and cannot be empty.' });
    }

    const insertQueries = [];
    const values = [];

    // Loop through each record and build the insert queries
    educationRecords.forEach(record => {
        const { Degree, CollegeInstitute, YearOfCompletion } = record;

        // Insert statement for each education record
        insertQueries.push(
            `(${UserID}, ?, ?, ?)` // UserID, Degree, CollegeInstitute, and YearOfCompletion
        );

        // Add the values for the prepared query
        values.push(Degree, CollegeInstitute, YearOfCompletion);
    });

    try {
        // Construct the query with correct column names
        const query = `
            INSERT INTO education (UserID, Degree, CollegeInstitute, YearOfCompletion) 
            VALUES ${insertQueries.join(', ')}
            ON DUPLICATE KEY UPDATE Degree = VALUES(Degree), CollegeInstitute = VALUES(CollegeInstitute), YearOfCompletion = VALUES(YearOfCompletion)
        `;
        
        // Execute the query
        await pool.query(query, values);

        res.json({ message: 'Education information saved successfully' });
    } catch (error) {
        console.error("🔴 Error:", error);  // Log the full error message
        res.status(500).json({ error: 'Failed to save education information' });
    }
});

export default router;
