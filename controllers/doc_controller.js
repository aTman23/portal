// Get all doctor list
const db = require("../config/db");

const getdoc = async (req, res) => {
    try {
        const data = await db.query('SELECT * FROM doc');
        if (data[0].length === 0) {
            return res.status(404).send({
                success: false,
                message: 'No records found',
            });
        }
        res.status(200).send({
            success: true,
            message: 'All doctors list found',
            totaldoc: data[0].length,
            data: data[0],
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: 'Error in GET ALL Doc API',
            error,
        });
    }
};

// Get doctor by ID
const getdocbyid = async (req, res) => {
    try {
        const DocId = req.params.UserID; // corrected parameter access
        if (!DocId) {
            return res.status(404).send({
                success: false,
                message: 'Invalid Doctor ID',
            });
        }
        const data = await db.query('SELECT * FROM doc WHERE UserID = ?', [DocId]);
        if (data[0].length === 0) {
            return res.status(404).send({
                success: false,
                message: 'No records found',
            });
        }
        res.status(200).send({
            success: true,
            DoctorDetails: data[0],
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: 'Error in get doc by UserID',
            error,
        });
    }
};


// create doctor by post
const createDoctor = async (req,res) => {
    try {
        const {Email,Password,FirstName,LastName,RegistrationDate,LastLoginDate} = req.body
        if(!Email || !Password || !FirstName || !LastName || !RegistrationDate || !LastLoginDate){
            return res.status(500).send({
                success:false,
                message:"Please Provide all fields",
            });
        }

         const data = await db.query(`INSERT INTO doc (Email,Password,FirstName,LastName,RegistrationDate,LastLoginDate) VALUES (?,?,?,?,?,?)`,[Email,Password,FirstName,LastName,RegistrationDate,LastLoginDate]);
         if(!data) {
            res.status(404).send({
                success:false,
                message: 'error in insert query',
            });
         }

         res.status(201).send({
            success:true,
            message:'new student record created',
         });

    } catch (error) {
      console.log(error)
      res.status(500).send({
        success:false,
        message:'Error in create doctor id',
        error
      })  
    }
}

//update doctor
const updatedoc = async (req, res) => {
    try {
        const Doc_id = req.params.UserID;
        if (!Doc_id) {
            return res.status(400).send({
                success: false,
                message: 'Invalid or missing User ID',
            });
        }

        const { Email, Password, FirstName, LastName, RegistrationDate, LastLoginDate } = req.body;

        const [result] = await db.query(
            `UPDATE doc 
             SET Email = ?, Password = ?, FirstName = ?, LastName = ?, 
                 RegistrationDate = ?, LastLoginDate = ? 
             WHERE UserId = ?`, 
            [Email, Password, FirstName, LastName, RegistrationDate, LastLoginDate, Doc_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).send({
                success: false,
                message: 'No doctor found with the given User ID',
            });
        }

        res.status(200).send({
            success: true,
            message: 'Doctor data updated successfully',
        });

    } catch (error) {
        console.error('Error updating doctor:', error);
        res.status(500).send({
            success: false,
            message: 'Server error occurred while updating doctor',
            error: error.message,  // Only send relevant error message
        });
    }
};


module.exports = { getdoc, getdocbyid, createDoctor,updatedoc };
