// routes/pricingRoutes.js
import express from 'express';
import pool from '../config/db.js';
const router = express.Router();

router.post('/pricing', async (req, res) => {
    const { user_id, pricing_type, custom_price } = req.body;
    try {
        await pool.query(
            `INSERT INTO pricing (user_id, pricing_type, custom_price) 
             VALUES (?, ?, ?) 
             ON DUPLICATE KEY UPDATE pricing_type = VALUES(pricing_type), custom_price = VALUES(custom_price)`,
            [user_id, pricing_type, custom_price]
        );
        res.json({ message: 'Pricing information saved successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to save pricing information' });
    }
});

export default router;
