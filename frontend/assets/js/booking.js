const startDate = new Date();
const daySlotsContainer = document.getElementById("day-slots");
const timeSlotsContainer = document.getElementById("time-slots");
const dayDates = [];

const daysOfWeek = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
];

// Get selected date and time from URL
const urlParams = new URLSearchParams(window.location.search);
const selectedDate = urlParams.get("date");
const selectedTime = urlParams.get("time");

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

// Generate and render 7 days from today
for (let i = 0; i < 7; i++) {
  const currentDay = new Date(startDate);
  currentDay.setDate(startDate.getDate() + i);
  dayDates.push(currentDay);

  const formattedDate = `${currentDay.getFullYear()}-${String(currentDay.getMonth() + 1).padStart(2, "0")}-${String(currentDay.getDate()).padStart(2, "0")}`;

  const daySlot = document.createElement("li");
  daySlot.innerHTML = `
    <span>${currentDay.toLocaleString("en-US", { weekday: "long" })}</span>
    <span class="slot-date">
      ${currentDay.getDate()} ${currentDay.toLocaleString("en-US", { month: "short" })}
      <small class="slot-year">${currentDay.getFullYear()}</small>
    </span>
  `;

  daySlot.addEventListener("click", () => {
    document.querySelectorAll("#day-slots li").forEach(slot => slot.classList.remove("active"));
    daySlot.classList.add("active");

    const newParams = new URLSearchParams(window.location.search);
    newParams.set("date", formattedDate);
    window.location.search = newParams.toString();
  });

  if (formattedDate === selectedDate) {
    daySlot.classList.add("active");
  }

  daySlotsContainer.appendChild(daySlot);
}

// Utilities
function removeDuplicates(slots) {
  const seen = new Set();
  return slots.filter(slot => {
    if (seen.has(slot)) return false;
    seen.add(slot);
    return true;
  });
}

function sortSlots(slots) {
  return slots.sort((a, b) => {
    const [aStart] = a.split(" - ");
    const [bStart] = b.split(" - ");
    const [aH, aM] = aStart.split(":").map(Number);
    const [bH, bM] = bStart.split(":").map(Number);
    return aH * 60 + aM - (bH * 60 + bM);
  });
}

function displaySlots(data) {
  timeSlotsContainer.innerHTML = "";

  const selected = dayDates.find(date => {
    const d = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    return d === selectedDate;
  });

  if (!selected) return;

  const weekday = selected.toLocaleString("en-US", { weekday: "long" });
  const slots = removeDuplicates(data[weekday] || []);
  const sortedSlots = sortSlots(slots);

  if (sortedSlots.length === 0) {
    const noSlotItem = document.createElement("li");
    noSlotItem.innerHTML = `<a class="timing"><span>No slots available</span></a>`;
    timeSlotsContainer.appendChild(noSlotItem);
    return;
  }

  sortedSlots.forEach(slot => {
    const [start, end] = slot.split(" - ");
    const startTime = new Date(selected);
    const [sh, sm] = start.split(":").map(Number);
    startTime.setHours(sh, sm);

    const endTime = new Date(selected);
    const [eh, em] = end.split(":").map(Number);
    endTime.setHours(eh, em);

    const timeLink = document.createElement("a");
    timeLink.className = "timing";
    timeLink.href = "#";

    if (endTime < new Date()) {
      timeLink.classList.add("disabled");
      timeLink.setAttribute("aria-disabled", "true");
      timeLink.style.pointerEvents = "none";
    } else {
      timeLink.addEventListener("click", () => {
        document.querySelectorAll("#time-slots a").forEach(el => el.classList.remove("active"));
        timeLink.classList.add("active");

        const newParams = new URLSearchParams(window.location.search);
        newParams.set("time", slot);
        window.location.search = newParams.toString();
      });
    }

    if (slot === selectedTime) {
      timeLink.classList.add("active");
    }

    timeLink.innerHTML = `<span>${slot}</span>`;
    const li = document.createElement("li");
    li.appendChild(timeLink);
    timeSlotsContainer.appendChild(li);
  });
}
