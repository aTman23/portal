import express from 'express';
<<<<<<< HEAD
import pool from './config/db.js'; // MySQL Pool
=======
import pool from './config/db.js'; // Ensure this points correctly to db.js
>>>>>>> 90eafb63372e06f4bb1feea5e2b1c736c5338344
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
            return res.status(200).json({ message: 'Login successful' });
        } else {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Server error.' });
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
        console.log('Registering doctor with data:', { name, mobile, email });

        await pool.query('INSERT INTO doc (Name, Mobile, Email, Password) VALUES (?, ?, ?, ?)', [name, mobile, email, password]);
        return res.status(201).json({ message: 'Registration successful.' });
    } catch (error) {
<<<<<<< HEAD
        console.error('Error during doctor registration:', error); // Log the error
=======
        console.error('Error during doctor registration:', error);
>>>>>>> 90eafb63372e06f4bb1feea5e2b1c736c5338344
        return res.status(500).json({ message: 'Server error during registration.' });
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
        return res.status(201).json({ message: 'Registration successful.' });
    } catch (error) {
        return res.status(500).json({ message: 'Server error.' });
    }
});

// Fetch Appointments for a Doctor
<<<<<<< HEAD
app.get('/appointments/:doctorId', async (req, res) => {
=======
app.get('/appointments/doctor/:doctorId', async (req, res) => {
>>>>>>> 90eafb63372e06f4bb1feea5e2b1c736c5338344
    const { doctorId } = req.params;

    try {
        const [appointments] = await pool.query('SELECT * FROM appointments WHERE DoctorID = ?', [doctorId]);
        return res.status(200).json({ appointments });
    } catch (error) {
        console.error('Error fetching appointments:', error);
        return res.status(500).json({ message: 'Unable to fetch appointments at this time.' });
<<<<<<< HEAD
=======
    }
});

// Fetch Appointments for a Patient
app.get('/appointments/patient/:patientId', async (req, res) => {
    const { patientId } = req.params;

    try {
        const [appointments] = await pool.query('SELECT * FROM appointments WHERE PatientID = ?', [patientId]);
        return res.status(200).json({ appointments });
    } catch (error) {
        console.error('Error fetching patient appointments:', error);
        return res.status(500).json({ message: 'Unable to fetch patient appointments at this time.' });
    }
});

// Book Appointment Route
app.post('/book-appointment', async (req, res) => {
    const { doctorId, patientId, date, time } = req.body;

    if (!doctorId || !patientId || !date || !time) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        await pool.query(
            'INSERT INTO appointments (DoctorID, PatientID, AppointmentDate, AppointmentTime) VALUES (?, ?, ?, ?)',
            [doctorId, patientId, date, time]
        );

        return res.status(200).json({ message: 'Appointment booked successfully.' });
    } catch (error) {
        console.error('Error booking appointment:', error);
        return res.status(500).json({ message: 'Server error while booking appointment.' });
>>>>>>> 90eafb63372e06f4bb1feea5e2b1c736c5338344
    }
});

// Update Appointment Status
// Update Appointment Status
app.put('/appointments/:appointmentId', async (req, res) => {
    const { appointmentId } = req.params;
    const { status } = req.body;

    if (!['accepted', 'declined'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status value.' });
    }

    try {
        await pool.query('UPDATE appointments SET Status = ? WHERE AppointmentID = ?', [status, appointmentId]);
        return res.status(200).json({ message: 'Appointment status updated successfully.' });
    } catch (error) {
        console.error('Error updating appointment:', error);
        return res.status(500).json({ message: 'Server error while updating appointment status.' });
    }
});
<<<<<<< HEAD
=======

// Fetch Psychologist Details by Name
>>>>>>> 90eafb63372e06f4bb1feea5e2b1c736c5338344
app.get('/psychologist/:name', async (req, res) => {
    const psychologistName = req.params.name; // Get the psychologist's name from the URL

    try {
        // Query the database for the psychologist's details
        const [rows] = await pool.query('SELECT * FROM doc WHERE Name = ?', [psychologistName]);

        if (rows.length > 0) {
            // If the psychologist is found, return the details
            res.status(200).json(rows[0]);
        } else {
            // If no psychologist is found, return a 404 status
            res.status(404).json({ message: 'Psychologist not found.' });
        }
    } catch (error) {
        console.error('Error fetching psychologist details:', error);
        res.status(500).json({ message: 'Server error while fetching psychologist details.' });
    }
});
<<<<<<< HEAD
=======

// Start the server
>>>>>>> 90eafb63372e06f4bb1feea5e2b1c736c5338344
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
