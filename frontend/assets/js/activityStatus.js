document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('activity_status');
    const doctorId = '/* doctorId here */'; 
    
    toggle.addEventListener('change', () => {
        const activityStatus = toggle.checked;

        fetch(`/activity-status/toggle/${doctorId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ activityStatus }),
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            const statusMessage = document.querySelector('.status-message');
            statusMessage.style.display = 'block';
            statusMessage.innerText = data.success ? "Status updated successfully" : "Error updating status";
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });
});
