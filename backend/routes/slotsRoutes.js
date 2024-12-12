import express from "express";
import pool from "../config/db.js";

const router = express.Router();

router.post("/addslot", async (req, res) => {
  const { userId, slot, day_of_the_week } = req.body;

  // Validate input
  if (!userId || !slot || !day_of_the_week) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  if (
    ![
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ].includes(
      day_of_the_week.charAt(0).toUpperCase() +
        day_of_the_week.slice(1).toLowerCase()
    )
  ) {
    return res.status(400).json({ message: "Invalid day_of_the_week value." });
  }



  try {
    const [existingSlots] = await pool.query(
      "SELECT * FROM slots WHERE userId = ? AND slot = ? AND day_of_the_week = ?",
      [userId, slot, day_of_the_week]
    );

    if (existingSlots.length > 0) {
      return res
        .status(400)
        .json({
          message: "Slot already exists for the given psychologist and day.",
        });
    }

    const insertQuery = `INSERT INTO slots (userId, slot, day_of_the_week) VALUES (?, ?, ?)`;
    const [result] = await pool.query(insertQuery, [
      userId,
      slot,
      day_of_the_week,
    ]);

    res.status(201).json({ message: "Slot added successfully." });
  } catch (error) {
    console.error("Error handling schedule:", error);
    res.status(500).json({ message: "Error adding schedule." });
  }
});

// Deleting a slot by ID
router.delete("/slot", async (req, res) => {
  const { slotId } = req.body;

  // Validate input
  if (!slotId) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  try {
    // Check if the slot exists before trying to delete it
    const [existingSlots] = await pool.query(
      "SELECT * FROM slots WHERE id = ?",
      [slotId]
    );

    if (existingSlots.length === 0) {
      return res.status(404).json({ message: "No slot found to delete." });
    }

    // Delete the slot
    const deleteQuery = "DELETE FROM slots WHERE id = ?";
    const [result] = await pool.query(deleteQuery, [slotId]);

    // Check if the delete operation was successful
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "No slot found to delete." });
    }

    res.status(200).json({ message: "Slot deleted successfully." });
  } catch (error) {
    console.error("Error deleting slot:", error);
    res.status(500).json({ message: "Error deleting slot." });
  }
});

router.get("/week", async (req, res) => {
  const { userId } = req.query;

  // Validate input
  if (!userId) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  try {
    // Query the database for slots based on userId
    const [slots] = await pool.query(
      "SELECT * FROM slots WHERE userId = ? ORDER BY FIELD(day_of_the_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'), slot",
      [userId]
    );

    if (slots.length === 0) {
      return res
        .status(404)
        .json({ message: "No slots found for the given user." });
    }

    // Group slots by day of the week
    const slotsByDay = slots.reduce((acc, slot) => {
      if (!acc[slot.day_of_the_week]) {
        acc[slot.day_of_the_week] = [];
      }
      acc[slot.day_of_the_week].push(slot);
      return acc;
    }, {});

    res.status(200).json({ slots: slotsByDay });
  } catch (error) {
    console.error("Error retrieving slots:", error);
    res.status(500).json({ message: "Error retrieving slots." });
  }
});

export default router;
