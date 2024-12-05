import express from 'express';
import { updateActivityStatus } from '../controllers/activityStatusController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.put('/update/:doctorId', authMiddleware, updateActivityStatus);

export default router;
