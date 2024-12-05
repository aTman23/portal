import Doctor from '../models/doctorModel.js';

export const updateActivityStatus = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const { activityStatus } = req.body;
        
        const updatedDoctor = await Doctor.findByIdAndUpdate(
            doctorId,
            { ActivityStatus: activityStatus },
            { new: true }
        );
        
        res.status(200).json({
            success: true,
            data: updatedDoctor
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
