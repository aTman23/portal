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
    for (const record of educationRecords) {
        const { Degree, CollegeInstitute, YearOfCompletion } = record;

        // Check if the record already exists for the same UserID and YearOfCompletion
        const checkQuery = `
            SELECT COUNT(*) AS count FROM education 
            WHERE UserID = ? AND YearOfCompletion = ?
        `;
        
        try {
            const [result] = await pool.query(checkQuery, [UserID, YearOfCompletion]);
            if (result[0].count > 0) {
                // If record exists, skip the insertion and move to the next
                console.log(`Duplicate found for UserID: ${UserID}, YearOfCompletion: ${YearOfCompletion}. Skipping.`);
                continue;
            }

            // If no duplicate, prepare the insert statement
            insertQueries.push(
                `(?, ?, ?, ?)` // UserID, Degree, CollegeInstitute, and YearOfCompletion
            );

            // Add the values for the prepared query
            values.push(UserID, Degree, CollegeInstitute, YearOfCompletion);

        } catch (error) {
            console.error("🔴 Error checking duplicate:", error);
            return res.status(500).json({ error: 'Error checking for duplicate records.' });
        }
    }

    if (insertQueries.length > 0) {
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
    } else {
        res.status(200).json({ message: 'No new education records to insert (duplicates found).' });
    }
});

export default router;
