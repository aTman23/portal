const express = require('express');
const pool = require('./config/db'); // MySQL Pool
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

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

// Registration Route
app.post('/register', async (req, res) => {
    const { name, mobile, email, password } = req.body;
    if (!name || !mobile || !email || !password) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        await pool.query('INSERT INTO doc (Name, Mobile, Email, Password) VALUES (?, ?, ?, ?)', [name, mobile, email, password]);
        res.status(201).json({ message: 'Registration successful.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error.' });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
