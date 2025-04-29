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
  // Clear existing slots
  timeSlotsContainer.innerHTML = "";

  for (let j = 0; j < 7; j++) {
    const currentDate = dayDates[j];
    const week = currentDate.toLocaleString("en-US", {
      weekday: "long",
    });

    const daySlots = data[week] || [];
    const uniqueSlots = removeDuplicates(daySlots);
    const sortedSlots = sortSlots(uniqueSlots);

    if (sortedSlots.length === 0) {
      const noSlotItem = document.createElement("li");
      const noSlotLink = document.createElement("a");
      noSlotLink.className = "timing";
      noSlotLink.innerHTML = `<span>No slots available</span>`;
      noSlotItem.appendChild(noSlotLink);
      timeSlotsContainer.appendChild(noSlotItem);
      continue;
    }

    sortedSlots.forEach((slot) => {
      const timeLink = document.createElement("a");
      timeLink.classList.add("timing");
      timeLink.href = "#";

      const [startSlot, endSlot] = slot.split(" - ");
      const startTime = new Date(dayDates[j]);
      const [startHour, startMinute] = startSlot.split(":");
      startTime.setHours(parseInt(startHour), parseInt(startMinute));

      const endTime = new Date(dayDates[j]);
      const [endHour, endMinute] = endSlot.split(":");
      endTime.setHours(parseInt(endHour), parseInt(endMinute));

      if (endTime < new Date()) {
        timeLink.classList.add("disabled");
        timeLink.setAttribute("aria-disabled", "true");
        timeLink.style.pointerEvents = "none";
      } else {
        timeLink.addEventListener("click", () => {
          const selectedTime = slot;

          const allTimeSlots = timeSlotsContainer.querySelectorAll("a");
          allTimeSlots.forEach((slot) => slot.classList.remove("active"));

          timeLink.classList.add("active");

          const newSearchParams = new URLSearchParams(window.location.search);
          newSearchParams.set("time", selectedTime);
          window.location.search = newSearchParams.toString();
        });
      }

      timeLink.innerHTML = `<span>${slot}</span>`;
      const slotItem = document.createElement("li");
      slotItem.appendChild(timeLink);
      timeSlotsContainer.appendChild(slotItem);
    });
  }
}

