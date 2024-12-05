import express from 'express';
import { updateActivityStatus } from '../controllers/activityStatusController.js';

const router = express.Router();

// Route to update doctor's activity status without middleware
router.put('/toggle/:doctorId', updateActivityStatus);

export default router;
