$(document).ready(function() {
    const appointmentDetails = JSON.parse(localStorage.getItem('appointmentDetails'));

    $('#payBtn').click(async function() {
        // Here you would normally handle payment processing logic.
        
        // Simulate payment success
        alert('Payment Successful!');

        // Book appointment after successful payment
        try {
            const response = await fetch('http://localhost:5000/book-appointment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(appointmentDetails)
            });

            if (response.ok) {
                const result = await response.json();
                alert(result.message);
                window.location.href = 'patient-profile.html'; // Redirect to patient profile page after booking
            } else {
                const error = await response.json();
                alert('Error booking appointment: ' + error.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while booking your appointment.');
        }
    });
});
