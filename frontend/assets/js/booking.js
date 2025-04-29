const startDate = new Date();
const daySlotsContainer = document.getElementById("day-slots");
const timeIntervals = [];

// Declare API, DoctorId, selectedDate, and selectedTime variables
const API ="https://portalserver-sepia.vercel.app"; // Replace with your actual API endpoint
const DoctorId = new URLSearchParams(window.location.search).get("doctorId"); // Example: get DoctorId from URL
const selectedDate = new URLSearchParams(window.location.search).get("date"); // Example: get selectedDate from URL
const selectedTime = new URLSearchParams(window.location.search).get("time"); // Example: get selectedTime from URL

var slot_data = {};
function fetchSlots(userId) {
  if (userId) {
    fetch(`${API}/timeslots/week?userId=${userId}`)
      .then((response) => response.json())
      .then((data) => {
        displaySlots(data.slots);
      })
      .catch((error) => {
        console.error("Error fetching slots:", error);
      });
  }
}

if (DoctorId) {
  fetchSlots(DoctorId);
}
const dayDates = [];

for (let i = 0; i < 7; i++) {
  const currentDay = new Date(startDate);
  currentDay.setDate(startDate.getDate() + i);
  dayDates.push(currentDay);

  const daySlot = document.createElement("li");

  const formattedDate = `${currentDay.getFullYear()}-${String(
    currentDay.getMonth() + 1
  ).padStart(2, "0")}-${String(currentDay.getDate()).padStart(2, "0")}`;

  daySlot.innerHTML = `
    <span>${currentDay.toLocaleString("en-US", { weekday: "long" })}</span>
    <span class="slot-date">
      ${currentDay.getDate()} ${currentDay.toLocaleString("en-US", {
    month: "short",
  })}
      <small class="slot-year">${currentDay.getFullYear()}</small>
    </span>
  `;

  if (formattedDate === selectedDate) {
    daySlot.classList.add("active");
  }

  daySlotsContainer.appendChild(daySlot);
}

const timeSlotsContainer = document.getElementById("time-slots");
const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

// Helper function to convert time string to minutes for sorting
function timeToMinutes(timeStr) {
  // Extract hours and minutes from the time string (e.g., "01:00 pm")
  const [time, period] = timeStr.split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  
  // Convert to 24-hour format for proper sorting
  if (period && period.toLowerCase() === 'pm' && hours < 12) {
    hours += 12;
  } else if (period && period.toLowerCase() === 'am' && hours === 12) {
    hours = 0;
  }
  
  return hours * 60 + minutes;
}

function displaySlots(data) {
  for (let j = 0; j < 7; j++) {
    const currentDate = dayDates[j];
    const week = currentDate.toLocaleString("en-US", {
      weekday: "long",
    });
    const timeSlotList = document.createElement("li");

    // If there are slots for this day, sort them by time
    if (data[week] && data[week].length > 0) {
      // Sort the time slots by time (AM first, then PM)
      data[week].sort((a, b) => {
        return timeToMinutes(a.slot) - timeToMinutes(b.slot);
      });
      
      data[week].forEach((time) => {
        const timeLink = document.createElement("a");
        timeLink.classList.add("timing");
        timeLink.href = "#";

        const [hour, minute] = time.slot.substring(0, 5).split(":");
        const slotTime = new Date(dayDates[j]);
        slotTime.setHours(hour, minute);

        const formattedSlotDate = `${slotTime.getFullYear()}-${String(
          slotTime.getMonth() + 1
        ).padStart(2, "0")}-${String(slotTime.getDate()).padStart(2, "0")}`;

        if (slotTime < new Date()) {
          timeLink.classList.add("disabled");
          timeLink.setAttribute("aria-disabled", "true");
          timeLink.style.pointerEvents = "none";
        } else {
          timeLink.addEventListener("click", () => {
            const dateStr = formattedSlotDate;
            const timeStr = time.slot;

            const newSearchParams = new URLSearchParams(window.location.search);
            newSearchParams.set("date", dateStr);
            newSearchParams.set("time", timeStr);

            window.location.search = newSearchParams.toString();
          });
        }

        if (formattedSlotDate === selectedDate && time.slot === selectedTime) {
          timeLink.classList.add("active");
        }

        // Add proper spacing between time slots
        timeLink.innerHTML = `<span>${time.slot}</span>`;
        timeSlotList.appendChild(timeLink);
      });
    } else if (data[week] === undefined || data[week]?.length === 0) {
      timeSlotList.innerHTML = `<a class="timing"><span>No slots available</span></a>`;
    }

    timeSlotsContainer.appendChild(timeSlotList);
  }
}