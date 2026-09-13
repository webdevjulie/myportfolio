/**
 * Send Message Function - Direct to Formspree
 * Handles contact form submission with validation and feedback
 * Works on GitHub Pages (no backend required)
 */

export async function initMessageForm() {
  const form = document.getElementById('contact-form');
  const submitBtn = document.getElementById('submit-btn');
  const successMessage = document.getElementById('success-message');
  const errorMessage = document.getElementById('error-message');

  if (!form || !submitBtn) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Get form data
    const formData = new FormData(form);
    const data = {
      name: formData.get('name')?.trim(),
      email: formData.get('email')?.trim(),
      message: formData.get('message')?.trim(),
    };

    // Validation
    if (!validateForm(data)) {
      showError('Please fill in all fields correctly.', errorMessage, successMessage);
      return;
    }

    // Show loading state
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    hideMessages(successMessage, errorMessage);

    try {
      // Send directly to Formspree
      const response = await sendViaFormspree(data);

      if (response.ok) {
        // Success
        form.reset();
        submitBtn.textContent = 'Send Message';
        submitBtn.disabled = false;
        showSuccess('Message sent successfully! We\'ll get back to you soon.', successMessage, errorMessage);
      } else {
        throw new Error(`Formspree error: ${response.status}`);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      submitBtn.textContent = 'Send Message';
      submitBtn.disabled = false;
      showError('Failed to send message. Please try again or contact us directly.', errorMessage, successMessage);
    }
  });
}

/**
 * Validate form data
 */
function validateForm(data) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!data.name || data.name.length < 2) return false;
  if (!data.email || !emailRegex.test(data.email)) return false;
  if (!data.message || data.message.length < 10) return false;

  return true;
}

/**
 * Send message directly to Formspree
 * No backend required - works on GitHub Pages!
 */
async function sendViaFormspree(data) {
  const formspreeId = 'mvkojglb'; // Your Formspree ID
  
  try {
    console.log('Sending to Formspree:', formspreeId);
    
    const response = await fetch(`https://formspree.io/f/${formspreeId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        message: data.message,
      }),
    });

    console.log('Formspree response status:', response.status);
    return response;
  } catch (error) {
    console.error('Formspree error:', error);
    throw error;
  }
}

/**
 * Show success message
 */
function showSuccess(message, successEl, errorEl) {
  if (errorEl) {
    errorEl.classList.add('hidden');
    errorEl.classList.remove('block');
  }

  if (successEl) {
    successEl.textContent = message;
    successEl.classList.remove('hidden');
    successEl.classList.add('block');

    // Auto-hide after 5 seconds
    setTimeout(() => {
      if (successEl) {
        successEl.classList.add('hidden');
        successEl.classList.remove('block');
      }
    }, 5000);
  }
}

/**
 * Show error message
 */
function showError(message, errorEl, successEl) {
  if (successEl) {
    successEl.classList.add('hidden');
    successEl.classList.remove('block');
  }

  if (errorEl) {
    errorEl.textContent = message;
    errorEl.classList.remove('hidden');
    errorEl.classList.add('block');

    // Auto-hide after 5 seconds
    setTimeout(() => {
      if (errorEl) {
        errorEl.classList.add('hidden');
        errorEl.classList.remove('block');
      }
    }, 5000);
  }
}

/**
 * Hide all messages
 */
function hideMessages(successEl, errorEl) {
  if (successEl) {
    successEl.classList.add('hidden');
    successEl.classList.remove('block');
  }
  if (errorEl) {
    errorEl.classList.add('hidden');
    errorEl.classList.remove('block');
  }
}
