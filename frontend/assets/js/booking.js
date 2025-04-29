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
function displaySlots(data) {
  const displayedSlots = new Set(); // To track shown slots
  timeSlotsContainer.innerHTML = ""; // Clear previous slots

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

    // Skip duplicates
    if (displayedSlots.has(slotLabel)) return;
    displayedSlots.add(slotLabel);

    const timeItem = document.createElement("li"); // Create new <li>
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
        const dateStr = selectedDate;
        const timeStr = time.slot;

        const newSearchParams = new URLSearchParams(window.location.search);
        newSearchParams.set("date", dateStr);
        newSearchParams.set("time", timeStr);

        window.location.search = newSearchParams.toString();
      });
    }

    if (selectedDate === selectedDate && time.slot === selectedTime) {
      timeLink.classList.add("active");
    }

    timeItem.appendChild(timeLink);
    timeSlotsContainer.appendChild(timeItem);
  });
}
