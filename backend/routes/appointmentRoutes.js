import express from "express";
import pool from "../config/db.js";
import nodemailer from "nodemailer"; // for email notifications
import generateGoogleMeetLink from "../utils/meet.js"; // a utility function for generating Google Meet links

const router = express.Router();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.Email,
    pass: process.env.Password,
  },
});

router.get("/data/:doctorId", async (req, res) => {
  const { doctorId } = req.params;

  try {
    const today = new Date();
    const todayDate = today.toISOString().slice(0, 10);
    const todayTime = today.toISOString().slice(11, 19);

    // Fetch today's appointments
    const [todayAppointments] = await pool.query(
      "SELECT * FROM appointments WHERE DoctorID = ? AND AppointmentDate = ?",
      [doctorId, todayDate]
    );

    // Fetch upcoming appointments
    const [upcomingAppointments] = await pool.query(
      "SELECT * FROM appointments WHERE DoctorID = ? AND AppointmentDate > ?",
      [doctorId, todayDate]
    );

    // Fetch past appointments
    const [pastAppointments] = await pool.query(
      "SELECT * FROM appointments WHERE DoctorID = ? AND AppointmentDate < ?",
      [doctorId, todayDate]
    );

    // Get total unique patients
    const [uniquePatients] = await pool.query(
      "SELECT DISTINCT PatientID FROM appointments WHERE DoctorID = ?",
      [doctorId]
    );

    // Get total appointments today
    const [totalAppointmentsToday] = await pool.query(
      "SELECT COUNT(*) AS totalAppointmentsToday FROM appointments WHERE DoctorID = ? AND AppointmentDate = ?",
      [doctorId, todayDate]
    );

    // Get total unique patients today
    const [uniquePatientsToday] = await pool.query(
      "SELECT DISTINCT PatientID FROM appointments WHERE DoctorID = ? AND AppointmentDate = ?",
      [doctorId, todayDate]
    );

    // Fetch patient details for unique patients
    const patientIds = uniquePatients.map((patient) => patient.PatientID);

    let patientDetails = [];
    if (patientIds.length > 0) {
      const placeholders = patientIds.map(() => "?").join(","); // Create placeholders
      const [patientDetailsResult] = await pool.query(
        `SELECT * FROM patients WHERE PatientID IN (${placeholders})`,
        [...patientIds] // Spread the patient IDs as individual parameters
      );
      patientDetails = patientDetailsResult;
    }

    // Fetch patient details for unique patients today
    const patientIdsToday = uniquePatientsToday.map(
      (patient) => patient.PatientID
    );
    let patientDetailsToday = [];
    if (patientIdsToday.length > 0) {
      const placeholdersToday = patientIdsToday.map(() => "?").join(","); // Create placeholders
      const [patientDetailsTodayResult] = await pool.query(
        `SELECT * FROM patients WHERE PatientID IN (${placeholdersToday})`,
        [...patientIdsToday] // Spread the patient IDs as individual parameters
      );
      patientDetailsToday = patientDetailsTodayResult;
    }

    return res.status(200).json({
      todayAppointments,
      upcomingAppointments,
      pastAppointments,
      totalUniquePatients: uniquePatients.length,
      totalAppointmentsToday: totalAppointmentsToday[0].totalAppointmentsToday,
      totalUniquePatientsToday: uniquePatientsToday.length,
      patientDetails,
      patientDetailsToday,
    });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return res
      .status(500)
      .json({ message: "Unable to fetch appointments at this time." });
  }
});


router.get("/patients/:doctorId", async (req, res) => {
    const { doctorId } = req.params;
  
    try {
      // Get unique patient IDs for the given doctor
      const [uniquePatients] = await pool.query(
        "SELECT DISTINCT PatientID FROM appointments WHERE DoctorID = ?",
        [doctorId]
      );
  
      // Extract patient IDs from the result
      const patientIds = uniquePatients.map((patient) => patient.PatientID);
  
      let patientDetails = [];
      if (patientIds.length > 0) {
        const placeholders = patientIds.map(() => "?").join(",");
        const [patientDetailsResult] = await pool.query(
          `SELECT * FROM patients WHERE PatientID IN (${placeholders})`,
          [...patientIds] 
        );
        patientDetails = patientDetailsResult;
      }
  
      return res.status(200).json({
        totalUniquePatients: patientDetails.length,
        patientDetails,
      });
    } catch (error) {
      console.error("Error fetching unique patients:", error);
      return res
        .status(500)
        .json({ message: "Unable to fetch unique patient details at this time." });
    }
  });
  

  router.get("/appointments/:doctorId", async (req, res) => {
    const { doctorId } = req.params;
  
    try {
      // Fetch appointments along with patient details for the given doctor
      const [appointments] = await pool.query(
        `SELECT a.*, p.PatientID, p.Name, p.Mobile, p.Age, p.Gender, p.Email 
         FROM appointments AS a
         JOIN patients AS p ON a.PatientID = p.PatientID
         WHERE a.DoctorID = ?`,
        [doctorId]
      );
  
      return res.status(200).json({
        totalAppointments: appointments.length,
        appointments,
      });
    } catch (error) {
      console.error("Error fetching appointments with patient details:", error);
      return res
        .status(500)
        .json({ message: "Unable to fetch appointment details at this time." });
    }
  });
  

router.get("/patient/:patientId", async (req, res) => {
  const { patientId } = req.params;

  try {
    const [appointments] = await pool.query(
      "SELECT * FROM appointments WHERE PatientID = ?",
      [patientId]
    );
    return res.status(200).json({ appointments });
  } catch (error) {
    console.error("Error fetching patient appointments:", error);
    return res
      .status(500)
      .json({ message: "Unable to fetch patient appointments at this time." });
  }
});

router.post("/book", async (req, res) => {
  const { doctorId, date, time, patientEmail, patientName, Mobile, Purpose,utrNo,slot } =
    req.body;

  if (!doctorId || !date || !time || !patientEmail) {
    return res
      .status(400)
      .json({ message: "All fields are required, including patient email." });
  }

  try {
    let patientId;
    const [existingPatients] = await pool.query(
      "SELECT PatientID FROM patients WHERE Email = ?",
      [patientEmail]
    );

    if (existingPatients.length > 0) {
      patientId = existingPatients[0].PatientID;
    } else {
      const [newPatient] = await pool.query(
        "INSERT INTO patients (Email,Name,Mobile)  VALUES (?,?,?)",
        [patientEmail, patientName, Mobile]
      );

      if (newPatient.affectedRows === 0) {
        return res
          .status(500)
          .json({ message: "Failed to create a new patient record." });
      }

      patientId = newPatient.insertId;
    }

    const [existingAppointments] = await pool.query(
      'SELECT * FROM appointments WHERE DoctorID = ? AND AppointmentDate = ? AND AppointmentTime = ? AND Status = "booked"',
      [doctorId, date, time]
    );

    if (existingAppointments.length > 0) {
      return res.status(400).json({ message: "Timeslot is already booked." });
    }
    const [doctordetails] = await pool.query(
      'SELECT Email FROM doc WHERE UserID = ?',
      [doctorId]
    );
    const doctorEmail = doctordetails[0].Email;
    const datetimeString = `${date}T${time}`; 
    const googleMeetLink = await generateGoogleMeetLink(patientEmail,doctorEmail,Purpose,datetimeString) || "https://meet.google.com/new";
    const [result] = await pool.query(
      'INSERT INTO appointments (DoctorID, PatientID, AppointmentDate, AppointmentTime, Status,utrNo,slot, MeetLink,Purpose) VALUES (?, ?, ?, ?, "booked",?,?, ?,?)',
      [doctorId, patientId, date, time,utrNo, slot, googleMeetLink, Purpose]
    );

    if (result.affectedRows === 0) {
      return res
        .status(500)
        .json({ message: "Failed to book the appointment." });
    }



    return res
      .status(200)
      .json({ message: "Appointment booked successfully." });
  } catch (error) {
    console.error("Error booking appointment:", error);
    return res
      .status(500)
      .json({ message: "Server error while booking appointment." });
  }
});

// Update Appointment Status
router.put("/status/:appointmentId", async (req, res) => {
  const { appointmentId } = req.params;
  const { status } = req.body;

  if (!["accepted", "declined"].includes(status)) {
    return res.status(400).json({ message: "Invalid status value." });
  }

  try {
    const [result] = await pool.query(
      "UPDATE appointments SET Status = ? WHERE AppointmentID = ?",
      [status, appointmentId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Appointment not found." });
    }


    const [appointmentDetails] = await pool.query(
      "SELECT a.*, p.Email FROM appointments a JOIN patients p ON a.PatientID = p.PatientID WHERE AppointmentID = ?",
      [appointmentId]
    );

    const patientEmail = appointmentDetails[0].Email;

    if (status === "accepted") {
      const mailOptions = {
      from: process.env.Email,
      to: patientEmail,
      subject: "Appointment acceptance",
      text: `Your appointment is accepted. Here is your Google Meet link: ${appointmentDetails[0].MeetLink}`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
      } else {
        console.log("Email sent:", info.response);
      }
      });
    }



    

    return res
      .status(200)
      .json({ message: "Appointment status updated successfully." });
  } catch (error) {
    console.error("Error updating appointment status:", error);
    return res
      .status(500)
      .json({ message: "Server error while updating appointment status." });
  }
});

export default router;
