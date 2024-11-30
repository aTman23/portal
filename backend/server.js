import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import patientRoutes from './routes/patientRoutes.js';
import basicInfoRoutes from './routes/basicInfoRoutes.js';
import educationRoutes from './routes/educationRoutes.js';
import experienceRoutes from './routes/experienceRoutes.js';
import pricingRoutes from './routes/pricingRoutes.js';
import timeslotRoutes from './routes/timeslotRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import slotsRoutes from './routes/slotsRoutes.js'

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/timeslots', timeslotRoutes);
app.use('/notifications', notificationRoutes);
app.use('/auth', authRoutes);
app.use('/appoint', appointmentRoutes);
app.use('/doctors', doctorRoutes);
app.use('/patients', patientRoutes);
app.use('/profile/basic-info', basicInfoRoutes);
app.use('/profile/education', educationRoutes);
app.use('/profile/experience', experienceRoutes);
app.use('/profile/pricing', pricingRoutes);
app.use('/slots', slotsRoutes);

app.get("/check", (req, res) => {
    res.json({ success: "working" });
});

// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
