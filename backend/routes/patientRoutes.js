import express from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../config/db.js';

const router = express.Router();

// Patient Registration Route
router.post('/register', [
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

export default router;
