const startDate = new Date();
const daySlotsContainer = document.getElementById("day-slots");
const timeIntervals = [];

var slot_data = {};

function fetchSlots(userId) {
  console.log("Fetching slots for userId:", userId);
  if (userId) {
    fetch(`${API}/timeslots/week?userId=${userId}`)
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched slot data:", data);
        displaySlots(data.slots);
      })
      .catch((error) => {
        console.error("Error fetching slots:", error);
      });
  }
}

if (DoctorId) {
  console.log("DoctorId available:", DoctorId);
  fetchSlots(DoctorId);
} else {
  console.log("No DoctorId found");
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

  console.log("Creating day slot for date:", formattedDate);

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
    console.log("Marking as active date:", formattedDate);
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

function displaySlots(data) {
  console.log("Displaying slots with data:", data);
  const displayedSlots = new Set();
  timeSlotsContainer.innerHTML = "";

  const selectedDay = new Date(selectedDate).toLocaleString("en-US", { weekday: "long" });
  const selectedDaySlots = data[selectedDay];

  console.log("Selected day:", selectedDay);
  console.log("Slots for selected day:", selectedDaySlots);

  if (!selectedDaySlots || selectedDaySlots.length === 0) {
    console.warn("No slots available for this day.");
    const noSlotItem = document.createElement("li");
    noSlotItem.innerHTML = `<a class="timing"><span>No slots available</span></a>`;
    timeSlotsContainer.appendChild(noSlotItem);
    return;
  }

  selectedDaySlots.forEach((time) => {
    const slotLabel = time.slot;
    console.log("Processing slot:", slotLabel);

    if (displayedSlots.has(slotLabel)) {
      console.log("Duplicate slot skipped:", slotLabel);
      return;
    }
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
      console.log("Slot is in the past, disabling:", slotLabel);
      timeLink.classList.add("disabled");
      timeLink.setAttribute("aria-disabled", "true");
      timeLink.style.pointerEvents = "none";
    } else {
      timeLink.addEventListener("click", () => {
        const dateStr = selectedDate;
        const timeStr = time.slot;

        console.log("Slot clicked:", { date: dateStr, time: timeStr });

        const newSearchParams = new URLSearchParams(window.location.search);
        newSearchParams.set("date", dateStr);
        newSearchParams.set("time", timeStr);

        window.location.search = newSearchParams.toString();
      });
    }

    if (selectedDate === selectedDate && time.slot === selectedTime) {
      console.log("Marking slot as active:", slotLabel);
      timeLink.classList.add("active");
    }

    timeItem.appendChild(timeLink);
    timeSlotsContainer.appendChild(timeItem);
  });
}
