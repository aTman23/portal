const startDate = new Date();
  const daySlotsContainer = document.getElementById("day-slots");
  const timeSlotsContainer = document.getElementById("time-slots");

  let selectedDate = "";
  let selectedTime = "";
  let slot_data = {}; // will be filled after API call

  // Fetch all week's slots once and store
  function fetchSlots(userId) {
    if (userId) {
      fetch(`${API}/timeslots/week?userId=${userId}`)
        .then((response) => response.json())
        .then((data) => {
          slot_data = data.slots;
          generateDaySlots(); // Generate day UI only after slots are ready
        })
        .catch((error) => {
          console.error("Error fetching slots:", error);
        });
    }
  }

  // Generate next 7 days and attach click event for each
  function generateDaySlots() {
    daySlotsContainer.innerHTML = ""; // clear previous
    const dayDates = [];

    for (let i = 0; i < 7; i++) {
      const currentDay = new Date(startDate);
      currentDay.setDate(startDate.getDate() + i);
      const formattedDate = `${currentDay.getFullYear()}-${String(currentDay.getMonth() + 1).padStart(2, '0')}-${String(currentDay.getDate()).padStart(2, '0')}`;
      const dayLabel = currentDay.toLocaleString("en-US", { weekday: "long" });

      dayDates.push({ date: formattedDate, label: dayLabel });

      const daySlot = document.createElement("li");
      daySlot.innerHTML = `
        <span>${dayLabel}</span>
        <span class="slot-date">
          ${currentDay.getDate()} ${currentDay.toLocaleString("en-US", { month: "short" })}
          <small class="slot-year">${currentDay.getFullYear()}</small>
        </span>
      `;

      // Click to update selectedDate and display slots
      daySlot.addEventListener("click", () => {
        selectedDate = formattedDate;

        // remove "active" from all
        document.querySelectorAll("#day-slots li").forEach(el => el.classList.remove("active"));
        daySlot.classList.add("active");

        displaySlotsForDay(dayLabel);
      });

      daySlotsContainer.appendChild(daySlot);
    }

    // Auto-select today initially
    const today = dayDates[0];
    selectedDate = today.date;
    document.querySelector("#day-slots li").classList.add("active");
    displaySlotsForDay(today.label);
  }

  // Display time slots only for selected day
  function displaySlotsForDay(weekday) {
    const displayedSlots = new Set();
    timeSlotsContainer.innerHTML = "";

    const slots = slot_data[weekday];

    if (!slots || slots.length === 0) {
      const noSlot = document.createElement("li");
      noSlot.innerHTML = `<a class="timing"><span>No slots available</span></a>`;
      timeSlotsContainer.appendChild(noSlot);
      return;
    }

    for (const timeObj of slots) {
      const slot = timeObj.slot;

      // Avoid duplicates
      if (displayedSlots.has(slot)) continue;
      displayedSlots.add(slot);

      const timeItem = document.createElement("li");
      const timeLink = document.createElement("a");
      timeLink.classList.add("timing");
      timeLink.href = "#";
      timeLink.innerHTML = `<span>${slot}</span>`;

      // Check if slot is in the past
      const [fromHour, fromMinute] = slot.substring(0, 5).split(":");
      const slotTime = new Date(selectedDate);
      slotTime.setHours(fromHour, fromMinute, 0, 0);

      if (slotTime < new Date()) {
        timeLink.classList.add("disabled");
        timeLink.setAttribute("aria-disabled", "true");
        timeLink.style.pointerEvents = "none";
      } else {
        timeLink.addEventListener("click", () => {
          selectedTime = slot;

          const newParams = new URLSearchParams(window.location.search);
          newParams.set("date", selectedDate);
          newParams.set("time", slot);
          window.location.search = newParams.toString();
        });
      }

      if (selectedTime === slot) {
        timeLink.classList.add("active");
      }

      timeItem.appendChild(timeLink);
      timeSlotsContainer.appendChild(timeItem);
    }
  }