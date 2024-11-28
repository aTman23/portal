import express from 'express'
import pool from '../config/db.js'

const router = express.Router();

function convertTo24HourFormat(time) {
  const [timeString, period] = time.split(' '); // Split time from AM/PM
  let [hours, minutes] = timeString.split(':'); // Split hours and minutes
  
  // Convert to integer values
  hours = parseInt(hours);
  
  // Adjust hour based on AM/PM
  if (period === 'PM' && hours !== 12) {
    hours += 12; // Convert PM hour to 24-hour format
  } else if (period === 'AM' && hours === 12) {
    hours = 0; // Convert 12 AM to 00 in 24-hour format
  }

  // Ensure the hour is in two digits
  const formattedHour = hours < 10 ? `0${hours}` : hours;
  const formattedMinutes = minutes; // Minutes remain the same

  return `${formattedHour}:${formattedMinutes}`;
}

//Inserting a slot
router.post('/slots', async (req, res) => {
  const { psychologist_id, start_time, end_time, day_of_the_week } = req.body;

  // Validate input
  if (!psychologist_id || !start_time || !end_time || !day_of_the_week) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }

  if (!['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].includes(day_of_the_week)) {
    return res.status(400).json({ message: 'Invalid day_of_the_week value.' });
  }

  try {
    // Check for overlapping schedules
    const conflictQuery = `
      SELECT * FROM schedules
      WHERE psychologist_id = ? AND day_of_the_week = ?
        AND (
          (start_time <= ? AND end_time > ?) OR  -- New start time overlaps an existing slot
          (start_time < ? AND end_time >= ?) OR -- New end time overlaps an existing slot
          (start_time >= ? AND end_time <= ?)   -- New slot is fully within an existing slot
        )
    `;
    const [conflicts] = await pool.query(conflictQuery, [
      psychologist_id,
      day_of_the_week,
      start_time, start_time, // New start time overlaps
      end_time, end_time,     // New end time overlaps
      start_time, end_time    // New slot fully within an existing slot
    ]);

    if (conflicts.length > 0) {
      return res.status(409).json({message: 'Conflict detected with an existing schedule.'});
    }

    // Insert the new schedule if no conflicts exist
    try {
      // Convert the 12-hour formatted times to 24-hour format
      const startTime24 = convertTo24HourFormat(start_time);
      const endTime24 = convertTo24HourFormat(end_time);
  
      // Insert the slot into the database
      const insertQuery = `
        INSERT INTO slots (psychologist_id, start_time, end_time, day_of_the_week)
        VALUES (?, ?, ?, ?)
      `;
      const [result] = await pool.query(insertQuery, [
        psychologist_id,
        startTime24,
        endTime24,
        day_of_the_week
      ]);
  
      res.status(200).json({message: 'Slot inserted successfully.'});
    } catch (error) {
      console.error('Error inserting slot:', error);
      res.status(500).json({ message: 'Error inserting slot.' });
    }
  } catch (error) {
    console.error('Error handling schedule:', error);
    res.status(500).json({ message: 'Error adding schedule.' });
  }
});

//Updating a slot
router.put('/slots', async (req, res) => {
  const { psychologist_id, start_time, end_time, day_of_the_week } = req.body;

  // Validate input
  if (!psychologist_id || !start_time || !end_time || !day_of_the_week) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }

  if (!['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].includes(day_of_the_week)) {
    return res.status(400).json({ message: 'Invalid day_of_the_week value.' });
  }

  try {
    // Check for overlapping slots based on psychologist_id and day_of_the_week
    const conflictQuery = `
      SELECT * FROM slots
      WHERE psychologist_id = ? AND day_of_the_week = ?
        AND (
          (start_time <= ? AND end_time > ?) OR  -- New start time overlaps an existing slot
          (start_time < ? AND end_time >= ?) OR -- New end time overlaps an existing slot
          (start_time >= ? AND end_time <= ?)   -- New slot is fully within an existing slot
        )
    `;
    const [conflicts] = await pool.query(conflictQuery, [
      psychologist_id,
      day_of_the_week,
      start_time, start_time, // New start time overlaps
      end_time, end_time,     // New end time overlaps
      start_time, end_time    // New slot fully within an existing slot
    ]);

    if (conflicts.length > 0) {
      return res.status(409).json({message: 'Conflict detected with existing slot(s). Please adjust the timings.'});
    }

    // Update the slots if no conflicts exist
    try {
      // Convert the 12-hour formatted times to 24-hour format
      const startTime24 = convertTo24HourFormat(start_time);
      const endTime24 = convertTo24HourFormat(end_time);
  
      // Update the slot in the database
      const updateQuery = `
        UPDATE slots
        SET start_time = ?, end_time = ?
        WHERE psychologist_id = ? AND day_of_the_week = ?
      `;
      const [result] = await pool.query(updateQuery, [
        startTime24,
        endTime24,
        psychologist_id,
        day_of_the_week
      ]);
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Slot not found for the given psychologist and day.' });
      }
  
      res.status(200).json({message: 'Slot updated successfully.'});
    } catch (error) {
      console.error('Error updating slot:', error);
      res.status(500).json({ message: 'Error updating slot.' });
    }
  } catch (error) {
    console.error('Error updating slot:', error);
    res.status(500).json({ message: 'Error updating slot.' });
  }
});

//Deleting a slot
router.delete('/slots', async (req, res) => {
  const { psychologist_id, start_time, day_of_the_week } = req.body;

  // Validate input
  if (!psychologist_id || !start_time || !day_of_the_week) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }

  if (!['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].includes(day_of_the_week)) {
    return res.status(400).json({ message: 'Invalid day_of_the_week value.' });
  }

  try {
    // Check if the slot exists before trying to delete it
    const [existingSlots] = await pool.query(
      'SELECT * FROM slots WHERE psychologist_id = ? AND start_time = ? AND day_of_the_week = ?',
      [psychologist_id, start_time, day_of_the_week]
    );

    if (existingSlots.length === 0) {
      return res.status(404).json({ message: 'No slot found to delete.' });
    }

    // Delete the slot
    const deleteQuery = `
      DELETE FROM slots
      WHERE psychologist_id = ? AND start_time = ? AND day_of_the_week = ?
    `;
    const [result] = await pool.query(deleteQuery, [psychologist_id, start_time, day_of_the_week]);

    // Check if the delete operation was successful
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'No slot found to delete.' });
    }

    res.status(200).json({message: 'Slot deleted successfully.'});
  } catch (error) {
    console.error('Error deleting slot:', error);
    res.status(500).json({ message: 'Error deleting slot.' });
  }
});

//Retrieving a slot
function convertTo12HourFormat(time) {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const newHour = hour % 12 || 12; // Convert hour 0 to 12 (midnight)
  return `${newHour}:${minutes} ${suffix}`;
}

router.get('/slots', async (req, res) => {
  const { psychologist_id, day_of_the_week } = req.query;

  // Validate input
  if (!psychologist_id || !day_of_the_week) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }

  if (!['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].includes(day_of_the_week)) {
    return res.status(400).json({ message: 'Invalid day_of_the_week value.' });
  }

  try {
    // Query the database for slots based on psychologist_id and day_of_the_week
    const [slots] = await pool.query(
      'SELECT start_time, end_time FROM slots WHERE psychologist_id = ? AND day_of_the_week = ? ORDER BY start_time',
      [psychologist_id, day_of_the_week]
    );

    if (slots.length === 0) {
      return res.status(404).json({ message: 'No slots found for the given psychologist and day.' });
    }

    // Convert start_time and end_time to 12-hour format
    const slotsWith12HourFormat = slots.map(slot => ({
      time_range: `${convertTo12HourFormat(slot.start_time)} - ${convertTo12HourFormat(slot.end_time)}`
    }));

    // Return the slots in time order
    res.status(200).json({ slots: slotsWith12HourFormat });
  } catch (error) {
    console.error('Error retrieving slots:', error);
    res.status(500).json({ message: 'Error retrieving slots.' });
  }
});


export default router