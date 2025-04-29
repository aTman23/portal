const startDate = new Date();
const daySlotsContainer = document.getElementById("day-slots");
const timeIntervals = [];

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

  // Add a click event to each day slot for selection
  daySlot.addEventListener("click", () => {
    // Deselect all days
    const allDays = daySlotsContainer.querySelectorAll("li");
    allDays.forEach((slot) => slot.classList.remove("active"));

    // Mark the selected day as active
    daySlot.classList.add("active");

    // Set the selected date in the URL
    const selectedDayDate = formattedDate;
    const newSearchParams = new URLSearchParams(window.location.search);
    newSearchParams.set("date", selectedDayDate);
    window.location.search = newSearchParams.toString();
  });

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

function formatTimeSlot(startTime, endTime) {
  const options = { hour: '2-digit', minute: '2-digit', hour12: true };

  const start = new Date(startTime);
  const end = new Date(endTime);
  
  const startFormatted = start.toLocaleString('en-US', options);
  const endFormatted = end.toLocaleString('en-US', options);
  
  return `${startFormatted} - ${endFormatted}`;
}

function removeDuplicates(slots) {
  const uniqueSlots = [];
  const seen = new Set();

  slots.forEach(slot => {
    if (!seen.has(slot)) {
      seen.add(slot);
      uniqueSlots.push(slot);
    }
  });

  return uniqueSlots;
}

function sortSlots(slots) {
  const amSlots = [];
  const pmSlots = [];
  
  slots.forEach(slot => {
    const [startTime, endTime] = slot.split(" - ");
    const startHour = parseInt(startTime.split(":")[0]);
    const isPM = startHour >= 12;
    
    if (isPM) {
      pmSlots.push(slot);
    } else {
      amSlots.push(slot);
    }
  });

  // Sort AM and PM slots while keeping their order
  return amSlots.concat(pmSlots);
}

function displaySlots(data) {
  for (let j = 0; j < 7; j++) {
    const currentDate = dayDates[j];
    const week = currentDate.toLocaleString("en-US", {
      weekday: "long",
    });
    const timeSlotList = document.createElement("li");

    // Get the slots for the current day, remove duplicates, and sort
    const daySlots = data[week] || [];
    const uniqueSlots = removeDuplicates(daySlots);
    const sortedSlots = sortSlots(uniqueSlots);

    sortedSlots.forEach((slot) => {
      const timeLink = document.createElement("a");
      timeLink.classList.add("timing");
      timeLink.href = "#";

      // Format the slot time as "07:00 AM - 08:00 AM"
      const [startSlot, endSlot] = slot.split(" - ");
      const startTime = new Date(dayDates[j]);
      const [startHour, startMinute] = startSlot.split(":");
      startTime.setHours(parseInt(startHour), parseInt(startMinute));

      const endTime = new Date(dayDates[j]);
      const [endHour, endMinute] = endSlot.split(":");
      endTime.setHours(parseInt(endHour), parseInt(endMinute));

      const formattedSlotDate = `${startTime.getFullYear()}-${String(
        startTime.getMonth() + 1
      ).padStart(2, "0")}-${String(startTime.getDate()).padStart(2, "0")}`;

      // Disable past slots
      if (endTime < new Date()) {
        timeLink.classList.add("disabled");
        timeLink.setAttribute("aria-disabled", "true");
        timeLink.style.pointerEvents = "none";
      } else {
        // Add event listener to select a time slot
        timeLink.addEventListener("click", () => {
          const selectedTime = slot;

          // Deselect all time slots
          const allTimeSlots = timeSlotsContainer.querySelectorAll("a");
          allTimeSlots.forEach((slot) => slot.classList.remove("active"));

          // Mark the selected time slot as active
          timeLink.classList.add("active");

          // Set the selected time in the URL
          const newSearchParams = new URLSearchParams(window.location.search);
          newSearchParams.set("time", selectedTime);
          window.location.search = newSearchParams.toString();
        });
      }

      timeLink.innerHTML = `<span>${slot}</span>`;
      timeSlotList.appendChild(timeLink);
    });

    // If no slots are available for the day
    if (sortedSlots.length === 0) {
      timeSlotList.innerHTML = `<a class="timing"><span >No slots available</span></a>`;
    }

    timeSlotsContainer.appendChild(timeSlotList);
  }
}
