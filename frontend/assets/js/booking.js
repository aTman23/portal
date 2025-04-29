
const startDate = new Date();
const daySlotsContainer = document.getElementById("day-slots");
const timeSlotsContainer = document.getElementById("time-slots");

let selectedDate = ""; // Will be set on default load
let selectedTime = "";
let slot_data = {};

// Fetch available slots from API
function fetchSlots(userId) {
  if (userId) {
    fetch(`${API}/timeslots/week?userId=${userId}`)
      .then((response) => response.json())
      .then((data) => {
        slot_data = data.slots;
        displaySlots(slot_data);
      })
      .catch((error) => {
        console.error("Error fetching slots:", error);
      });
  }
}

// Show next 7 days and attach click listeners
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

  // Set first day as selected by default
  if (i === 0) {
    selectedDate = formattedDate;
    daySlot.classList.add("active");
  }

  // Add click event to select date and load time slots
  daySlot.addEventListener("click", () => {
    selectedDate = formattedDate;
    selectedTime = ""; // Reset selected time

    document.querySelectorAll("#day-slots li").forEach((el) =>
      el.classList.remove("active")
    );
    daySlot.classList.add("active");

    displaySlots(slot_data);
  });

  daySlotsContainer.appendChild(daySlot);
}

// Display time slots for the selected date
function displaySlots(data) {
  const displayedSlots = new Set();
  timeSlotsContainer.innerHTML = "";

  const selectedDay = new Date(selectedDate).toLocaleString("en-US", {
    weekday: "long",
  });
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
    slotTime.setHours(hour, minute, 0, 0);

    if (slotTime < new Date()) {
      timeLink.classList.add("disabled");
      timeLink.setAttribute("aria-disabled", "true");
      timeLink.style.pointerEvents = "none";
    } else {
      timeLink.addEventListener("click", () => {
        selectedTime = time.slot;

        // Highlight selected time
        document.querySelectorAll("#time-slots a").forEach((el) =>
          el.classList.remove("active")
        );
        timeLink.classList.add("active");

        // Update URL
        const newSearchParams = new URLSearchParams(window.location.search);
        newSearchParams.set("date", selectedDate);
        newSearchParams.set("time", selectedTime);
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