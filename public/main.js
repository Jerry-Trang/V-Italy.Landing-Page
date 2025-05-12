document.addEventListener('DOMContentLoaded', () => {
  const socket = io();
  const form = document.getElementById('contactForm');
  
  if (!form) {
    console.error('Contact form not found');
    return;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitButton = form.querySelector('button[type="submit"]');
    if (!submitButton) {
      console.error('Submit button not found');
      return;
    }
    
    const originalText = submitButton.innerHTML;
    
    try {
      // Get form elements
      const nameInput = form.querySelector('#name');
      const phoneInput = form.querySelector('#phone');
      const emailInput = form.querySelector('#email');

      // Validate form elements exist
      if (!nameInput || !phoneInput || !emailInput ) {
        throw new Error('Required form fields not found');
      }
      
      // Show loading state
      submitButton.disabled = true;
      submitButton.innerHTML = '<div class="loader mx-auto"></div>';
      
      // Get form data
      const formData = {
        name: nameInput.value,
        phone: phoneInput.value,
        email: emailInput.value,
      };
      
      // Validate required fields
      if (!formData.name || !formData.phone || !formData.email ) {
        throw new Error('Please fill in all required fields');
      }
      
      // Emit form data to server
      socket.emit('formSubmission', formData);
      
      // Handle success response
      socket.once('formSubmissionSuccess', (response) => {
        // Show success message
        const successMessage = document.createElement('div');
        successMessage.className = 'text-green-500 text-center mt-4';
        successMessage.textContent = `${response.message}`;
        form.appendChild(successMessage);
        
        // Reset form
        form.reset();
        
        // Reset button
        setTimeout(() => {
          submitButton.disabled = false;
          submitButton.innerHTML = originalText;
          
          // Remove success message after 5 seconds
          setTimeout(() => {
            successMessage.remove();
          }, 5000);
        }, 1500);
      });
      
      // Handle error response
      socket.once('formSubmissionError', (error) => {
        throw new Error(error.message);
      });
      
    } catch (error) {
      console.error('Error:', error);
      submitButton.disabled = false;
      submitButton.innerHTML = originalText;
      
      // Show error message
      const errorMessage = document.createElement('div');
      errorMessage.className = 'text-red-500 text-center mt-4';
      errorMessage.textContent = error.message || 'Có lỗi xảy ra. Vui lòng thử lại sau!';
      form.appendChild(errorMessage);
      
      setTimeout(() => {
        errorMessage.remove();
      }, 5000);
    }
  });
});