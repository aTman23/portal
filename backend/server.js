import express from 'express';
import pool from './db.js'; // Ensure you use .js if it's an ES module
import cors from 'cors';
import { body, validationResult } from 'express-validator';

const app = express();
app.use(cors());
app.use(express.json());

// Middleware to log incoming requests
app.use((req, res, next) => {
    console.log(`${req.method} request made to: ${req.url}`);
    console.log('Request Body:', req.body);
    next(); // Pass control to the next middleware or route handler
});

const PORT = process.env.PORT || 5000;

// Login Route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Both fields are required.' });
    }

    try {
        const [rows] = await pool.query('SELECT * FROM doc WHERE Email = ?', [email]);
        if (rows.length > 0 && rows[0].Password === password) {
            res.status(200).json({ message: 'Login successful' });
        } else {
            res.status(401).json({ message: 'Invalid email or password.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error.' });
    }
});

// Doctor Registration Route
app.post('/doctor-register', [
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
        // Log the incoming data for debugging
        console.log('Registering doctor with data:', { name, mobile, email });

        await pool.query('INSERT INTO doc (Name, Mobile, Email, Password) VALUES (?, ?, ?, ?)', [name, mobile, email, password]);
        res.status(201).json({ message: 'Registration successful.' });
    } catch (error) {
        console.error('Error during doctor registration:', error); // Log the error
        res.status(500).json({ message: 'Server error during registration.' });
    }
});

// Patient Registration Route
app.post('/register', [
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
        await pool.query('INSERT INTO patient (Name, Mobile, Email, Password) VALUES (?, ?, ?, ?)', [name, mobile, email, password]);
        res.status(201).json({ message: 'Registration successful.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error.' });
    }
});

// Fetch Appointments for a Doctor
app.get('/appointments/:doctorId', async (req, res) => {
    const doctorId = req.params.doctorId; // Get the doctor's ID from the request

    try {
        const [appointments] = await pool.query('SELECT * FROM appointments WHERE DoctorID = ?', [doctorId]);
        res.status(200).json({ appointments }); // Wrap in an object if needed
    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.status(500).json({ message: 'Unable to fetch appointments at this time.' });
    }
});

// Update Appointment Status
app.put('/appointments/:appointmentId', async (req, res) => {
    const appointmentId = req.params.appointmentId;
    const { status } = req.body;

    if (!['accepted', 'declined'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status value.' });
    }

    try {
        await pool.query('UPDATE appointments SET Status = ? WHERE AppointmentID = ?', [status, appointmentId]);
        res.status(200).json({ message: 'Appointment status updated successfully.' });
    } catch (error) {
        console.error('Error updating appointment:', error);
        res.status(500).json({ message: 'Server error while updating appointment status.' });
    }
});

import express from 'express';
import pool from './config/db.js'; // Ensure this is correctly set up
import cors from 'cors';
import { body, validationResult } from 'express-validator';

const app = express();
app.use(cors());
app.use(express.json());

// Route to get all doctors
app.get('/doctors', async (req, res) => {
    try {
        const [doctors] = await pool.query('SELECT * FROM doc'); // Adjust table name if necessary
        res.status(200).json(doctors);
    } catch (error) {
        console.error('Error fetching doctors:', error);
        res.status(500).json({ message: 'Server error while fetching doctors.' });
    }
});

// Route to get appointments by doctor ID
app.get('/appointments/doctor/:doctorId', async (req, res) => {
    const doctorId = req.params.doctorId;

    try {
        const [appointments] = await pool.query('SELECT * FROM appointments WHERE DoctorID = ?', [doctorId]);
        res.status(200).json({ appointments });
    } catch (error) {
        console.error('Error fetching appointments for doctor:', error);
        res.status(500).json({ message: 'Unable to fetch appointments for this doctor.' });
    }
});

// Route to get appointments by patient ID
app.get('/appointments/patient/:patientId', async (req, res) => {
    const patientId = req.params.patientId;

    try {
        const [appointments] = await pool.query('SELECT * FROM appointments WHERE PatientID = ?', [patientId]);
        res.status(200).json({ appointments });
    } catch (error) {
        console.error('Error fetching appointments for patient:', error);
        res.status(500).json({ message: 'Unable to fetch appointments for this patient.' });
    }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));



