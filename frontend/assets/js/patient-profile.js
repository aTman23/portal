$(document).ready(function() {
    const patientId = /* Get logged-in patient's ID */ // Implement logic to get patient ID

    function fetchAppointments() {
        $.get(`https://portalserver-sepia.vercel.app/patient/${patientId}`, function(data) {
            const appointments = data.appointments;
            $('#appointmentsTableBody').empty(); // Clear existing appointments

            appointments.forEach(appointment => {
                $('#appointmentsTableBody').append(`
                    <div class="appointment-list">
                        <h5>${appointment.AppointmentDate} at ${appointment.AppointmentTime}</h5>
                        <!-- Add more details as needed -->
                    </div>
                `);
            });
        }).fail(function() {
            alert('Error fetching appointments.');
        });
    }

    fetchAppointments(); // Fetch appointments when page loads
});
