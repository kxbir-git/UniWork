// UniWork Interactive Client Scripts

document.addEventListener('DOMContentLoaded', () => {
    // Mobile navigation collapse toggler
    const toggler = document.querySelector('.uw-toggler');
    const navCollapse = document.querySelector('.uw-nav-collapse');
    if (toggler && navCollapse) {
        toggler.addEventListener('click', () => {
            navCollapse.classList.toggle('show');
        });
    }

    // Auto-scroll chat box to bottom
    const chatBox = document.getElementById('chatMessagesBox');
    if (chatBox) {
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    // Interactive Demo Account Autofill for examiners & testers
    const demoButtons = document.querySelectorAll('.demo-fill-btn');
    demoButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const email = btn.getAttribute('data-email');
            const password = btn.getAttribute('data-pass');
            const emailInput = document.getElementById('id_email');
            const passInput = document.getElementById('id_password');
            if (emailInput && passInput) {
                emailInput.value = email;
                passInput.value = password;
            }
        });
    });

    // Contract message AJAX submission
    const chatForm = document.getElementById('contractChatForm');
    if (chatForm) {
        chatForm.addEventListener('submit', async (e) => {
            const input = document.getElementById('chatContentInput');
            if (!input || !input.value.trim()) return;

            // Optional AJAX enhancement:
            const formData = new FormData(chatForm);
            try {
                const response = await fetch(chatForm.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    if (data.content && chatBox) {
                        e.preventDefault();
                        const bubble = document.createElement('div');
                        bubble.className = 'chat-bubble chat-bubble-me';
                        bubble.innerHTML = `<div>${escapeHtml(data.content)}</div><small class="text-white-50 d-block text-end mt-1">${data.timestamp}</small>`;
                        chatBox.appendChild(bubble);
                        chatBox.scrollTop = chatBox.scrollHeight;
                        input.value = '';
                    }
                }
            } catch (err) {
                // Fallback to standard form submission
                console.log('Falling back to standard post submission:', err);
            }
        });
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.innerText = text;
        return div.innerHTML;
    }
});
