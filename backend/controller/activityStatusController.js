import { db } from '../config/database.js'; 

export const updateActivityStatus = (req, res) => {
    const { doctorId } = req.params;
    const { activityStatus } = req.body;

    if (!doctorId) {
        return res.status(400).json({ error: "doctorId is required" });
    }

    const query = 'UPDATE doc SET isActive = ? WHERE doctorID = ?';
    db.query(query, [activityStatus, doctorId], (err, result) => {
        if (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
        res.status(200).json({ success: true, data: result });
    });
};
