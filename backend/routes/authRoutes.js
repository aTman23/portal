import express from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../config/db.js';

const router = express.Router();

// Login Route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Both fields are required.' });
    }

    try {
        const [userRows] = await pool.query('SELECT * FROM doc WHERE Email = ?', [email]);
        console.log(userRows)
        if (userRows.length > 0 && userRows[0].Password === password) {
            const profileQuery = `
            SELECT 
                d.*,
                e.Degree,
                e.CollegeInstitute,
                e.YearOfCompletion,
                x.HospitalName,
                x.FromDate,
                x.ToDate,
                x.Designation,
                s.ServiceName,
                sp.SpecializationName
            FROM 
                doc d
            LEFT JOIN 
                education e ON d.UserID = e.UserID
            LEFT JOIN 
                experience x ON d.UserID = x.UserID
            LEFT JOIN 
                doctor_services s ON d.UserID = s.DoctorID
            LEFT JOIN 
                doctor_specializations sp ON d.UserID = sp.DoctorID
            WHERE 
                d.UserID = ?
            `;
    
            const [profileRows] = await pool.query(profileQuery, [userRows[0].UserID]);
    
            const result = {
                profile: profileRows[0],
                education: [],
                experience: [],
                services: [],
                specializations: [],
            };
    
            if (profileRows.length > 0) {
                profileRows.forEach((row) => {
                    if (row.Degree) {
                        result.education.push({
                            Degree: row.Degree,
                            CollegeInstitute: row.CollegeInstitute,
                            YearOfCompletion: row.YearOfCompletion,
                        });
                    }
                    if (row.HospitalName) {
                        result.experience.push({
                            HospitalName: row.HospitalName,
                            FromDate: row.FromDate,
                            ToDate: row.ToDate,
                            Designation: row.Designation,
                        });
                    }
                    if (row.ServiceName) {
                        result.services.push(row.ServiceName);
                    }
                    if (row.SpecializationName) {
                        result.specializations.push(row.SpecializationName);
                    }
                });
            }
    
            return res.json({ message: 'Login successful', data: result });
        } else {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Server error.' });
    }
});


// Doctor Registration Route
router.post('/doctor-register', [
    body('name').isLength({ min: 3 }).withMessage('Name must be at least 3 characters long.'),
    body('mobile').isMobilePhone().withMessage('Mobile number is not valid.'),
    body('email').isEmail().withMessage('Email is not valid.'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, mobile, email, password } = req.body;

    try {
        await pool.query('INSERT INTO doc (Name, Mobile, Email, Password) VALUES (?, ?, ?, ?)', [name, mobile, email, password]);
        return res.status(201).json({ message: 'Registration successful.' });
    } catch (error) {
        return res.status(500).json({ message: 'Server error during registration.' });
    }
});


router.post('/updatepassword', async (req, res) => {
    const { oldpassword, newpassword, email } = req.body;
    console.log(oldpassword,newpassword,email)

    try {
        // Check if the old password matches
        const [user] = await pool.query('SELECT Password FROM doc WHERE Email = ?', [email]);
        console.log(user)
        if (!user || user[0].Password !== oldpassword) {
            return res.status(400).json({ message: 'Old password is incorrect' });
        }

        // Update the password
        await pool.query('UPDATE doc SET Password = ? WHERE Email = ?', [newpassword, email]);
        res.status(200).json({ message: 'Password updated successfully' });

    } catch (error) {
        res.status(500).json({ message: 'Error updating password', error });
    }
});

export default router;
