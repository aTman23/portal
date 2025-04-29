const startDate = new Date();
const daySlotsContainer = document.getElementById("day-slots");
const timeSlotsContainer = document.getElementById("time-slots");
let selectedDate = ""; // Will be set on day click
let selectedTime = ""; // Optional: used to highlight selected time
let slot_data = {}; // Will hold all 7 days of slot data

// Fetch weekly slots for doctor and store globally
function fetchSlots(userId) {
  if (userId) {
    fetch(`${API}/timeslots/week?userId=${userId}`)
      .then((response) => response.json())
      .then((data) => {
        slot_data = data.slots; // Save for later use
      })
      .catch((error) => {
        console.error("Error fetching slots:", error);
      });
  }
}

if (DoctorId) {
  fetchSlots(DoctorId);
}

// Generate 7-day clickable list
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

  // Add click event for day selection
  daySlot.addEventListener("click", () => {
    // Clear active class from all
    document.querySelectorAll("#day-slots li").forEach((li) => {
      li.classList.remove("active");
    });
    daySlot.classList.add("active");

    // Update selected date
    selectedDate = formattedDate;

    // Clear and show slots for selected day
    displaySlots(slot_data);
  });

  daySlotsContainer.appendChild(daySlot);
}

// Main slot rendering function
function displaySlots(data) {
  const displayedSlots = new Set();
  timeSlotsContainer.innerHTML = ""; // Clear old

  const selectedDay = new Date(selectedDate).toLocaleString("en-US", { weekday: "long" });
  const selectedDaySlots = data[selectedDay];

  if (!selectedDaySlots || selectedDaySlots.length === 0) {
    const noSlotItem = document.createElement("li");
    noSlotItem.innerHTML = `<a class="timing"><span>No slots available</span></a>`;
    timeSlotsContainer.appendChild(noSlotItem);
    return;
  }

  selectedDaySlots.forEach((time) => {
    const slotLabel = time.slot;
    if (displayedSlots.has(slotLabel)) return;
    displayedSlots.add(slotLabel);

    const timeItem = document.createElement("li");
    const timeLink = document.createElement("a");
    timeLink.classList.add("timing");
    timeLink.href = "#";
    timeLink.innerHTML = `<span>${slotLabel}</span>`;

    const [hour, minute] = slotLabel.substring(0, 5).split(":");
    const slotTime = new Date(selectedDate);
    slotTime.setHours(hour, minute);

    if (slotTime < new Date()) {
      timeLink.classList.add("disabled");
      timeLink.setAttribute("aria-disabled", "true");
      timeLink.style.pointerEvents = "none";
    } else {
      timeLink.addEventListener("click", () => {
        selectedTime = time.slot;

        const newSearchParams = new URLSearchParams(window.location.search);
        newSearchParams.set("date", selectedDate);
        newSearchParams.set("time", time.slot);
        window.location.search = newSearchParams.toString();
      });
    }

    if (time.slot === selectedTime) {
      timeLink.classList.add("active");
    }

    timeItem.appendChild(timeLink);
    timeSlotsContainer.appendChild(timeItem);
  });
}
