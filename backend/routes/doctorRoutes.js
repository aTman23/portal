import express from "express";
import pool from "../config/db.js";
import multer from "multer";


const upload  = multer();
const router = express.Router();

// Multer setup for file uploads
router.get("/:name", async (req, res) => {
  const psychologistName = req.params.name;

  try {
      // Fetch the main doctor profile
      const profileQuery = `
          SELECT 
              d.* 
          FROM 
              doc d
          WHERE 
              d.Username = ?
      `;
      
      const [profileRows] = await pool.query(profileQuery, [psychologistName]);

      // Check if the psychologist exists
      if (profileRows.length === 0) {
          return res.status(404).json({ message: "Psychologist not found." });
      }

      const psychologistProfile = profileRows[0];

      // Fetch education details
      const educationQuery = `
          SELECT 
              Degree, 
              CollegeInstitute, 
              YearOfCompletion 
          FROM 
              education 
          WHERE 
              UserID = ?
      `;
      const [educationRows] = await pool.query(educationQuery, [psychologistProfile.UserID]);

      // Fetch experience details
      const experienceQuery = `
          SELECT 
              HospitalName, 
              FromDate, 
              ToDate, 
              Designation 
          FROM 
              experience 
          WHERE 
              UserID = ?
      `;
      const [experienceRows] = await pool.query(experienceQuery, [psychologistProfile.UserID]);

      // Fetch services provided
      const servicesQuery = `
          SELECT 
              ServiceName 
          FROM 
              doctor_services 
          WHERE 
              DoctorID = ?
      `;
      const [servicesRows] = await pool.query(servicesQuery, [psychologistProfile.UserID]);

      // Fetch specializations
      const specializationsQuery = `
          SELECT 
              SpecializationName 
          FROM 
              doctor_specializations 
          WHERE 
              DoctorID = ?
      `;
      const [specializationsRows] = await pool.query(specializationsQuery, [psychologistProfile.UserID]);

      // Construct the result object
      const result = {
          profile: psychologistProfile,
          education: educationRows.map(row => ({
              Degree: row.Degree,
              CollegeInstitute: row.CollegeInstitute,
              YearOfCompletion: row.YearOfCompletion,
          })),
          experience: experienceRows.map(row => ({
              HospitalName: row.HospitalName,
              FromDate: row.FromDate,
              ToDate: row.ToDate,
              Designation: row.Designation,
          })),
          services: servicesRows.map(row => row.ServiceName),
          specializations: specializationsRows.map(row => row.SpecializationName),
      };

      console.log(result);
      return res.json({ message: "Profile fetched successfully", data: result });
  } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Server error while fetching psychologist details." });
  }
});



router.get("/user-image/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    const connection = await pool.getConnection();

    // Fetch profile image as a buffer from the database
    const [rows] = await connection.query(
      "SELECT ProfileImage FROM doc WHERE UserID = ?",
      [userId]
    );

    // Check if an image exists for the user
    if (rows.length === 0 || !rows[0].ProfileImage) {
      return res.status(404).json({ error: "Image not found" });
    }

    const profileImageBuffer = rows[0].ProfileImage;

    // Convert the image buffer to a Base64 string
    const base64Image = profileImageBuffer.toString("base64");

    // Send the Base64 image as JSON (or you could directly send it as an image)
    res.json({
      imageUrl: `data:image/jpeg;base64,${base64Image}`, // or change 'jpeg' to 'png' if your images are PNG
    });
  } catch (error) {
    console.error("Error fetching profile image:", error);
    res.status(500).json({ error: "Failed to fetch profile image" });
  }
});

router.get("/d/:id", async (req, res) => {
  const psychologistName = req.params.id;

  try {
      // Fetch the main doctor profile
      const profileQuery = `
          SELECT 
              d.* 
          FROM 
              doc d
          WHERE 
              d.UserID = ?
      `;
      
      const [profileRows] = await pool.query(profileQuery, [psychologistName]);

      // Check if the psychologist exists
      if (profileRows.length === 0) {
          return res.status(404).json({ message: "Psychologist not found." });
      }

      const psychologistProfile = profileRows[0];

      // Fetch education details
      const educationQuery = `
          SELECT 
              Degree, 
              CollegeInstitute, 
              YearOfCompletion 
          FROM 
              education 
          WHERE 
              UserID = ?
      `;
      const [educationRows] = await pool.query(educationQuery, [psychologistProfile.UserID]);

      // Fetch experience details
      const experienceQuery = `
          SELECT 
              HospitalName, 
              FromDate, 
              ToDate, 
              Designation 
          FROM 
              experience 
          WHERE 
              UserID = ?
      `;
      const [experienceRows] = await pool.query(experienceQuery, [psychologistProfile.UserID]);

      // Fetch services provided
      const servicesQuery = `
          SELECT 
              ServiceName 
          FROM 
              doctor_services 
          WHERE 
              DoctorID = ?
      `;
      const [servicesRows] = await pool.query(servicesQuery, [psychologistProfile.UserID]);

      // Fetch specializations
      const specializationsQuery = `
          SELECT 
              SpecializationName 
          FROM 
              doctor_specializations 
          WHERE 
              DoctorID = ?
      `;
      const [specializationsRows] = await pool.query(specializationsQuery, [psychologistProfile.UserID]);

      // Construct the result object
      const result = {
          profile: psychologistProfile,
          education: educationRows.map(row => ({
              Degree: row.Degree,
              CollegeInstitute: row.CollegeInstitute,
              YearOfCompletion: row.YearOfCompletion,
          })),
          experience: experienceRows.map(row => ({
              HospitalName: row.HospitalName,
              FromDate: row.FromDate,
              ToDate: row.ToDate,
              Designation: row.Designation,
          })),
          services: servicesRows.map(row => row.ServiceName),
          specializations: specializationsRows.map(row => row.SpecializationName),
      };

      console.log(result);
      return res.json({ message: "Profile fetched successfully", data: result });
  } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Server error while fetching psychologist details." });
  }
});


// Route to update doctor profile details
router.put(
  "/update-profile/:userId", upload.single('profileImage'),async (req, res) => {
    const userId = req.params.userId;

    // Extracting fields from request body
    const {
      username,
      email,
      firstName,
      lastName,
      phoneNumber,
      gender,
      dateOfBirth,
      aboutMe,
      biography,
      clinicName,
      clinicAddress,
      addressLine1,
      addressLine2,
      city,
      stateProvince,
      country,
      postalCode,
      pricingFree,
      customPricePerHour,
    } = req.body;

    let education = [];
    let experience = [];

    try {
      education = JSON.parse(req.body.education || "[]");
      experience = JSON.parse(req.body.experience || "[]");
      console.log(experience);
    } catch (error) {
      return res
        .status(400)
        .json({
          error: "Invalid JSON format in education or experience fields",
        });
    }

    const clinicImages = [null,null];
    const userImage = req.file ? req.file.buffer : null;

  

    const profileQuery = `
        UPDATE doc
        SET Username = ?, Email = ?, FirstName = ?, LastName = ?, PhoneNumber = ?,
            Gender = ?, DateOfBirth = ?, AboutMe = ?, Biography = ?, ClinicName = ?,
            ClinicAddress = ?, AddressLine1 = ?, AddressLine2 = ?, City = ?, StateProvince = ?,
            Country = ?, PostalCode = ?, PricingFree = ?, CustomPricePerHour = ?, 
            ProfileImage = ?, ClinicImage1 = ?, ClinicImage2 = ?
        WHERE UserID = ?
    `;

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Execute profile update
      await connection.query(profileQuery, [
        username,
        email,
        firstName,
        lastName,
        phoneNumber,
        gender,
        dateOfBirth,
        aboutMe,
        biography,
        clinicName,
        clinicAddress,
        addressLine1,
        addressLine2,
        city,
        stateProvince,
        country,
        postalCode,
        pricingFree,
        customPricePerHour,
        userImage,
        clinicImages[0],
        clinicImages[1],
        userId,
      ]);

      // Clear old education and experience records
      await connection.query("DELETE FROM education WHERE UserID = ?", [
        userId,
      ]);
      await connection.query("DELETE FROM experience WHERE UserID = ?", [
        userId,
      ]);

      // Insert new education records if provided
      if (education.length > 0) {
        const eduQuery = `
                INSERT INTO education (UserID, Degree, CollegeInstitute, YearOfCompletion)
                VALUES ?
            `;
        const eduValues = education.map(
          ({ degree, collegeInstitute, yearOfCompletion }) => [
            userId,
            degree,
            collegeInstitute,
            yearOfCompletion,
          ]
        );
        await connection.query(eduQuery, [eduValues]);
      }

      // Insert new experience records if provided
      if (experience.length > 0) {
        const expQuery = `
                INSERT INTO experience (UserID, HospitalName, FromDate, ToDate, Designation)
                VALUES ?
            `;
        const expValues = experience.map(
          ({ hospitalName, fromDate, toDate, designation }) => [
            userId,
            hospitalName,
            fromDate,
            toDate,
            designation,
          ]
        );
        await connection.query(expQuery, [expValues]);
      }

      // Commit transaction and fetch updated user data
      await connection.commit();
      const profileQueryget = `
        SELECT 
            d.*,
            e.Degree,
            e.CollegeInstitute,
            e.YearOfCompletion,
            x.HospitalName,
            x.FromDate,
            x.ToDate,
            x.Designation
        FROM 
            doc d
        LEFT JOIN 
            education e ON d.UserID = e.UserID
        LEFT JOIN 
            experience x ON d.UserID = x.UserID
        WHERE 
            d.UserID = ?
    `;

      const [rows] = await pool.query(profileQueryget, [userId]);
      // Process the result
      const result = {
        profile: rows[0], // This will contain the user profile from the doc table
        education: [],
        experience: [],
      };

      // Check if rows are returned
      if (rows.length > 0) {
        // Loop through the rows to gather education and experience
        rows.forEach((row) => {
          if (row.Degree) {
            // Assuming Degree is a valid field in education
            result.education.push({
              Degree: row.Degree,
              CollegeInstitute: row.CollegeInstitute,
              YearOfCompletion: row.YearOfCompletion,
            });
          }
          if (row.HospitalName) {
            result.experience.push({
              HospitalName: row.HospitalName,
              FromDate: row.FromDate,
              ToDate: row.ToDate,
              Designation: row.Designation,
            });
          }
        });
      }

     return res.json({ message: "Profile fetched successfully", data: result });
    } catch (error) {
      console.error("Update profile error:", error);
      await connection.rollback();
      res.status(500).json({ error: "Failed to update profile information" });
    } finally {
      connection.release();
    }
  }
);

router.post("/doctor/:doctorId/add-service", async (req, res) => {
  const { doctorId } = req.params;
  const { serviceName } = req.body;
  try {
    await pool.query(
      "INSERT INTO doctor_services (DoctorID, ServiceName) VALUES (?, ?)",
      [doctorId, serviceName]
    );
    res.json({ message: "Service added to doctor successfully" });
  } catch (error) {
    console.error("Error adding service:", error);
    res.status(500).json({ error: "Error adding service" });
  }
});
router.delete("/doctor/:doctorId/remove-service", async (req, res) => {
  const { doctorId } = req.params;
  const { serviceName } = req.body;

  try {
      await pool.query('DELETE FROM doctor_services WHERE DoctorID = ? AND ServiceName = ?', [doctorId, serviceName]);
      res.json({ message: "Service removed successfully" });
  } catch (error) {
      res.status(500).json({ message: "Error removing service", error });
  }
});

// Route to add a specialization for a doctor
router.post("/doctor/:doctorId/add-specialization", async (req, res) => {
  const { doctorId } = req.params;
  const { specializationName } = req.body;
  try {
    await pool.query(
      "INSERT INTO doctor_specializations (DoctorID, SpecializationName) VALUES (?, ?)",
      [doctorId, specializationName]
    );
    res.json({ message: "Specialization added to doctor successfully" });
  } catch (error) {
    console.error("Error adding specialization:", error);
    res.status(500).json({ error: "Error adding specialization" });
  }
});
router.delete("/doctor/:doctorId/remove-specialization", async (req, res) => {
  const { doctorId } = req.params;
  const { specializationName } = req.body;

  try {
      await pool.query('DELETE FROM doctor_specializations WHERE DoctorID = ? AND SpecializationName = ?', [doctorId, specializationName]);
      res.json({ message: "Specialization removed successfully" });
  } catch (error) {
      res.status(500).json({ message: "Error removing specialization", error });
  }
});

// Route to get all services of a doctor
router.get("/doctor/:doctorId/services", async (req, res) => {
  const { doctorId } = req.params;
  try {
    const [services] = await pool.query(
      "SELECT ServiceName FROM doctor_services WHERE DoctorID = ?",
      [doctorId]
    );
    res.json({ services });
  } catch (error) {
    console.error("Error fetching services:", error);
    res.status(500).json({ error: "Error fetching services" });
  }
});

// Route to get all specializations of a doctor
router.get("/doctor/:doctorId/specializations", async (req, res) => {
  const { doctorId } = req.params;
  try {
    const [specializations] = await pool.query(
      "SELECT SpecializationName FROM doctor_specializations WHERE DoctorID = ?",
      [doctorId]
    );
    res.json({ specializations });
  } catch (error) {
    console.error("Error fetching specializations:", error);
    res.status(500).json({ error: "Error fetching specializations" });
  }
});
export default router;
