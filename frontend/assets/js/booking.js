const startDate = new Date();
const daySlotsContainer = document.getElementById("day-slots");
const timeSlotsContainer = document.getElementById("time-slots");
const bookAptBtn = document.getElementById("bookApt");

// let selectedDate = new URLSearchParams(window.location.search).get("date");
// let selectedTime = new URLSearchParams(window.location.search).get("time");

// const API = "https://portalserver-sepia.vercel.app";
// const DoctorId = new URLSearchParams(window.location.search).get("doctorId");

function fetchSlots(userId) {
  if (userId) {
    fetch(`${API}/timeslots/week?userId=${userId}`)
      .then((response) => response.json())
      .then((data) => {
        renderDaySlots(data.slots);
        if (selectedDate) {
          displaySlots(data.slots);
        }
      })
      .catch((error) => console.error("Error fetching slots:", error));
  }
}

function renderDaySlots(data) {
  daySlotsContainer.innerHTML = "";

  for (let i = 0; i < 7; i++) {
    const currentDay = new Date(startDate);
    currentDay.setDate(startDate.getDate() + i);

    const formattedDate = `${currentDay.getFullYear()}-${String(currentDay.getMonth() + 1).padStart(2, "0")}-${String(currentDay.getDate()).padStart(2, "0")}`;

    const daySlot = document.createElement("li");
    daySlot.innerHTML = `
      <span>${currentDay.toLocaleString("en-US", { weekday: "long" })}</span>
      <span class="slot-date">
        ${currentDay.getDate()} ${currentDay.toLocaleString("en-US", { month: "short" })}
        <small class="slot-year">${currentDay.getFullYear()}</small>
      </span>
    `;

    if (formattedDate === selectedDate) {
      daySlot.classList.add("active");
    }

    daySlot.addEventListener("click", () => {
      selectedDate = formattedDate;
      selectedTime = null; // reset time on new date
      updateURLParams();
      clearActive(daySlotsContainer);
      daySlot.classList.add("active");
      displaySlots(data);
      updateBookButtonState();
    });

    daySlotsContainer.appendChild(daySlot);
  }
}

function displaySlots(slotData) {
  timeSlotsContainer.innerHTML = "";
  const selectedDay = new Date(selectedDate).toLocaleString("en-US", { weekday: "long" });
  const selectedDaySlots = slotData[selectedDay] || [];

  if (selectedDaySlots.length === 0) {
    timeSlotsContainer.innerHTML = `<li><a class="timing"><span>No slots available</span></a></li>`;
    return;
  }

  selectedDaySlots.forEach((slot) => {
    const slotLabel = slot.slot;
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
        selectedTime = slotLabel;
        clearActive(timeSlotsContainer);
        timeLink.classList.add("active");
        updateURLParams();
        updateBookButtonState();
      });
    }

    if (slotLabel === selectedTime) {
      timeLink.classList.add("active");
    }

    timeItem.appendChild(timeLink);
    timeSlotsContainer.appendChild(timeItem);
  });
}

function updateURLParams() {
  const params = new URLSearchParams(window.location.search);
  if (selectedDate) params.set("date", selectedDate);
  if (selectedTime) params.set("time", selectedTime);
  else params.delete("time");

  window.history.replaceState({}, "", `${window.location.pathname}?${params}`);
}

function updateBookButtonState() {
  if (selectedDate && selectedTime) {
    bookAptBtn.href = "checkout.html?" + new URLSearchParams(window.location.search).toString();
  } else {
    bookAptBtn.href = "#";
  }
}

function clearActive(container) {
  container.querySelectorAll(".active").forEach((el) => el.classList.remove("active"));
}

if (DoctorId) {
  fetchSlots(DoctorId);
}
