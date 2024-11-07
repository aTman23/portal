document.addEventListener("DOMContentLoaded", () => {
    // Existing code...
  
    // Fetch doctor's UPI details
    const doctorData = JSON.parse(localStorage.getItem('doc-data'));
    const doctorUpiId = doctorData?.profile?.upiId;
  
    // Show/hide UPI payment details based on payment method selection
    const upiRadio = document.querySelector('input[value="upi"]');
    const upiDetailsDiv = document.getElementById('upiPaymentDetails');
    const doctorUpiDisplay = document.getElementById('doctorUpiId');
  
    if (doctorUpiId) {
      document.getElementById('doctorUpiId').textContent = doctorUpiId;
    }
  
    document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        if (e.target.value === 'upi') {
          upiDetailsDiv.style.display = 'block';
        } else {
          upiDetailsDiv.style.display = 'none';
        }
      });
    });
  
    // Modify the submitBooking function to include payment method
    async function submitBooking() {
      // Existing booking code...
      
      const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
      
      const bookingData = {
        doctorId,
        date,
        time,
        patientEmail,
        patientName,
        Mobile,
        Purpose,
        paymentMethod,
        doctorUpiId: paymentMethod === 'upi' ? doctorUpiId : null
      };
  
      // Submit booking with payment information
      try {
        const response = await fetch("https://portalserver-sepia.vercel.app/appoint/book", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bookingData),
        });
        
        // Rest of the submission handling...
      } catch (error) {
        console.error("Error:", error);
      }
    }
  });
  