$(document).ready(function() {
    const urlParams = new URLSearchParams(window.location.search);
    const doctorId = urlParams.get('doctorId'); // Get doctor ID from URL

    function generateTimeSlots() {
        const startTime = new Date();
        const endTime = new Date(startTime.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days later

        while (startTime <= endTime) {
            const date = startTime.toISOString().split('T')[0]; // YYYY-MM-DD
            $('#timeSlots').append(`<h5>${date}</h5><div class="form-group">${createTimeSlots(date)}</div>`);
            startTime.setDate(startTime.getDate() + 1); // Move to next day
        }
    }

    function createTimeSlots(date) {
        let slots = '';
        for (let hour = 9; hour < 17; hour++) { // Assuming working hours from 9 AM to 5 PM
            for (let minute = 0; minute < 60; minute += 30) { // Half-hour slots
                const time = `${hour}:${minute === 0 ? '00' : minute}`;
                slots += `
                    <div class="form-check">
                        <input class="form-check-input" type="radio" name="${date}" value="${time}" id="${date}-${time}">
                        <label class="form-check-label" for="${date}-${time}">${time}</label>
                    </div>`;
            }
        }
        return slots;
    }

    generateTimeSlots(); // Call function to generate time slots

    $('#proceedToPay').click(function() {
        const selectedSlot = $('input[type=radio]:checked');
        if (selectedSlot.length === 0) {
            alert('Please select a time slot.');
            return;
        }

        const appointmentDetails = {
            doctorId: doctorId,
            patientId: /* Get patient ID from session or API */, // Implement logic to get patient ID
            date: selectedSlot.attr('name'),
            time: selectedSlot.val()
        };

        // Redirect to checkout page with appointment details in local storage
        localStorage.setItem('appointmentDetails', JSON.stringify(appointmentDetails));
        window.location.href = 'checkout.html';
    });
});
