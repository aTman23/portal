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
  const displayedSlots = new Set(); // To track already shown slots
  timeSlotsContainer.innerHTML = ""; // Clear previous slots

  for (let j = 0; j < 7; j++) {
    const currentDate = dayDates[j];
    const week = currentDate.toLocaleString("en-US", { weekday: "long" });
    const timeSlotList = document.createElement("li");

    if (data[week] === undefined || data[week].length === 0) {
      timeSlotList.innerHTML = `<a class="timing"><span>No slots available</span></a>`;
    } else {
      data[week].forEach((time) => {
        const slotLabel = `${time.slot}`;

        // Skip duplicates
        if (displayedSlots.has(slotLabel)) return;
        displayedSlots.add(slotLabel);

        const timeLink = document.createElement("a");
        timeLink.classList.add("timing");
        timeLink.href = "#";
        timeLink.innerHTML = `<span>${slotLabel}</span>`;

        const [hour, minute] = slotLabel.substring(0, 5).split(":");
        const slotTime = new Date(currentDate);
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

        timeSlotList.appendChild(timeLink);
      });
    }

    timeSlotsContainer.appendChild(timeSlotList);
  }
}
