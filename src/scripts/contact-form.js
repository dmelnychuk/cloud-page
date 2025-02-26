export const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.target;
    const button = form.querySelector('button');
    const messageDiv = document.getElementById('form-message');

    // Disable button and show loading state
    button.disabled = true;
    button.textContent = 'Sending...';

    try {
        const formData = new FormData(form);
        const response = await fetch('/api/send-email', {
            method: 'POST',
            body: JSON.stringify({
                name: formData.get('name'),
                email: formData.get('email'),
                subject: formData.get('subject'),
                message: formData.get('message')
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            messageDiv.className = 'form-message success';
            messageDiv.textContent = 'Message sent successfully!';
            form.reset();
        } else {
            throw new Error('Failed to send message');
        }
    } catch (error) {
        messageDiv.className = 'form-message error';
        messageDiv.textContent = 'Failed to send message. Please try again.';
    } finally {
        button.disabled = false;
        button.textContent = 'Send Message';
    }
};
