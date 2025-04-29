const startDate = new Date();
const daySlotsContainer = document.getElementById("day-slots");
const timeSlotsContainer = document.getElementById("time-slots");
const dayDates = [];
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

// Get selected date and time from URL
const urlParams = new URLSearchParams(window.location.search);
const selectedDate = urlParams.get("date");
const selectedTime = urlParams.get("time");

// Create and render 7 days starting from today
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

  daySlot.addEventListener("click", () => {
    const allDays = daySlotsContainer.querySelectorAll("li");
    allDays.forEach((slot) => slot.classList.remove("active"));
    daySlot.classList.add("active");

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

function formatTimeSlot(startTime, endTime) {
  const options = { hour: '2-digit', minute: '2-digit', hour12: true };
  const start = new Date(startTime);
  const end = new Date(endTime);
  const startFormatted = start.toLocaleString('en-US', options);
  const endFormatted = end.toLocaleString('en-US', options);
  return `${startFormatted} - ${endFormatted}`;
}

function displaySlots(data) {
  timeSlotsContainer.innerHTML = "";

  for (let j = 0; j < 7; j++) {
    const currentDate = dayDates[j];
    const weekDay = currentDate.toLocaleString("en-US", {
      weekday: "long",
    });

    const daySlots = data[weekDay] || [];
    if (daySlots.length === 0) {
      const noSlotItem = document.createElement("li");
      const noSlotLink = document.createElement("a");
      noSlotLink.className = "timing";
      noSlotLink.innerHTML = `<span>No slots available</span>`;
      noSlotItem.appendChild(noSlotLink);
      timeSlotsContainer.appendChild(noSlotItem);
      continue;
    }

    const uniqueSlots = removeDuplicates(daySlots);
    const sortedSlots = sortSlots(uniqueSlots);

    sortedSlots.forEach((slot) => {
      const [startSlot, endSlot] = slot.split(" - ");

      const startTime = new Date(currentDate);
      const [startHour, startMinute] = startSlot.split(":");
      startTime.setHours(parseInt(startHour), parseInt(startMinute));

      const endTime = new Date(currentDate);
      const [endHour, endMinute] = endSlot.split(":");
      endTime.setHours(parseInt(endHour), parseInt(endMinute));

      const formattedSlot = formatTimeSlot(startTime, endTime);
      const formattedSlotDate = `${startTime.getFullYear()}-${String(
        startTime.getMonth() + 1
      ).padStart(2, "0")}-${String(startTime.getDate()).padStart(2, "0")}`;

      const timeLink = document.createElement("a");
      timeLink.classList.add("timing");
      timeLink.href = "#";

      if (endTime < new Date()) {
        timeLink.classList.add("disabled");
        timeLink.setAttribute("aria-disabled", "true");
        timeLink.style.pointerEvents = "none";
      } else {
        timeLink.addEventListener("click", () => {
          const allTimeSlots = timeSlotsContainer.querySelectorAll("a");
          allTimeSlots.forEach((slot) => slot.classList.remove("active"));

          timeLink.classList.add("active");

          const newSearchParams = new URLSearchParams(window.location.search);
          newSearchParams.set("time", slot);
          window.location.search = newSearchParams.toString();
        });
      }

      if (formattedSlotDate === selectedDate && slot === selectedTime) {
        timeLink.classList.add("active");
      }

      timeLink.innerHTML = `<span>${formattedSlot}</span>`;
      const slotItem = document.createElement("li");
      slotItem.appendChild(timeLink);
      timeSlotsContainer.appendChild(slotItem);
    });
  }
}

function removeDuplicates(arr) {
  return [...new Set(arr)];
}

function sortSlots(slots) {
  return slots.sort((a, b) => {
    const [aStart] = a.split(" - ");
    const [bStart] = b.split(" - ");
    const [aHour, aMin] = aStart.split(":").map(Number);
    const [bHour, bMin] = bStart.split(":").map(Number);
    return aHour * 60 + aMin - (bHour * 60 + bMin);
  });
}
