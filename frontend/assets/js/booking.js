// Get URL query parameters


// Generate day slots dynamically
const startDate = new Date();
const daySlotsContainer = document.getElementById("day-slots");
const timeIntervals = ["9:00 AM", "10:00 AM", "11:00 AM", "01:00 PM", "02:00 PM", "03:00 PM"];
const dayDates = []; // Store generated dates to match with time slots later

for (let i = 0; i < 7; i++) {
  const currentDay = new Date(startDate);
  currentDay.setDate(startDate.getDate() + i);
  dayDates.push(currentDay); // Save the date for later use

  const daySlot = document.createElement("li");

  const formattedDate = `${currentDay.getFullYear()}-${String(currentDay.getMonth() + 1).padStart(2, "0")}-${String(currentDay.getDate()).padStart(2, "0")}`;

  daySlot.innerHTML = `
    <span>${currentDay.toLocaleString("en-US", { weekday: "short" })}</span>
    <span class="slot-date">
      ${currentDay.getDate()} ${currentDay.toLocaleString("en-US", { month: "short" })}
      <small class="slot-year">${currentDay.getFullYear()}</small>
    </span>
  `;
  
  // Highlight day if it matches the selected date
  if (formattedDate === selectedDate) {
    daySlot.classList.add("active");
  }
  
  daySlotsContainer.appendChild(daySlot);
}

// Generate time slots dynamically with disabled past slots
const timeSlotsContainer = document.getElementById("time-slots");

for (let j = 0; j < 7; j++) { // Loop for 7 days
  const currentDate = dayDates[j];
  const timeSlotList = document.createElement("li");

  timeIntervals.forEach((time) => {
    const timeLink = document.createElement("a");
    timeLink.classList.add("timing");
    timeLink.href = "#";

    const [hour, period] = time.split(" ");
    const slotTime = new Date(currentDate);
    slotTime.setHours(
      period === "PM" && hour !== "12" ? parseInt(hour) + 12 : parseInt(hour),
      0,
      0,
      0
    );

    const formattedTime = `${String(slotTime.getHours()).padStart(2, "0")}:${String(slotTime.getMinutes()).padStart(2, "0")}`;
    const formattedSlotDate = `${slotTime.getFullYear()}-${String(slotTime.getMonth() + 1).padStart(2, "0")}-${String(slotTime.getDate()).padStart(2, "0")}`;

    // Disable past slots
    if (slotTime < new Date()) {
      timeLink.classList.add("disabled");
      timeLink.setAttribute("aria-disabled", "true");
      timeLink.style.pointerEvents = "none";
    } else {
      // Add event listener for active slots
      timeLink.addEventListener("click", () => {
        const dateStr = formattedSlotDate;
        const timeStr = formattedTime;
        
        // Construct new query parameters without duplicates
        const newSearchParams = new URLSearchParams(window.location.search);
        newSearchParams.set("date", dateStr);
        newSearchParams.set("time", timeStr);
      
        // Update the URL search string
        window.location.search = newSearchParams.toString();
      });
      
    }

    // Highlight the time slot if it matches selected date and time
    if (formattedSlotDate === selectedDate && formattedTime === selectedTime) {
      timeLink.classList.add("active");
    }

    timeLink.innerHTML = `<span>${hour}</span> <span>${period}</span>`;
    timeSlotList.appendChild(timeLink);
  });



  timeSlotsContainer.appendChild(timeSlotList);
}
