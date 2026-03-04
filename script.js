document.addEventListener('DOMContentLoaded', () => {
    // Initialize Telegram WebApp to extract user information if opened in Telegram
    let telegramUser = null;
    let chatId = null;

    if (window.Telegram && window.Telegram.WebApp) {
        const tg = window.Telegram.WebApp;
        tg.ready();
        tg.expand();

        if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
            telegramUser = tg.initDataUnsafe.user;
            chatId = tg.initDataUnsafe.user.id;
        }
    }

    const targetAudienceRadios = document.querySelectorAll('input[name="targetAudience"]');
    const studentNameGroup = document.getElementById('studentNameGroup');
    const studentNameInput = document.getElementById('studentName');

    const form = document.getElementById('testForm');
    const submitBtn = document.getElementById('submitBtn');
    const successMessage = document.getElementById('successMessage');

    // Toggle specific student name input
    targetAudienceRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'specific') {
                studentNameGroup.style.display = 'flex';
                studentNameInput.required = true;
            } else {
                studentNameGroup.style.display = 'none';
                studentNameInput.required = false;
                studentNameInput.value = '';
            }
        });
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // ---------------------------------------------------------------------------------
        // IMPORTANT: REPLACE THE URL BELOW WITH YOUR ACTUAL N8N WEBHOOK URL!
        // Copy the 'Test URL' or 'Production URL' from your n8n Webhook node.
        // It should look something like: 'https://your-n8n.com/webhook/1234-abcd-5678'
        // ---------------------------------------------------------------------------------
        const n8nWebhookUrl = 'https://joseph-unkidnapped-derangedly.ngrok-free.dev/webhook-test/ff424c15-f767-4c82-a6c1-dcccfbf4d70a';

        const audience = document.querySelector('input[name="targetAudience"]:checked').value;
        const studentName = document.getElementById('studentName').value.trim();
        const numQuestions = parseInt(document.getElementById('numQuestions').value);

        // Convert comma separated concepts to an array
        const conceptString = document.getElementById('conceptIds').value;
        const microConceptIds = conceptString.split(',')
            .map(item => item.trim())
            .filter(item => item.length > 0);

        // Put the data together as JSON
        const payload = {
            targetAudience: audience,
            studentName: audience === 'specific' ? studentName : null,
            numQuestions: numQuestions,
            microConceptIds: microConceptIds,
            telegramData: {
                user: telegramUser,
                chatId: chatId
            },
            submittedAt: new Date().toISOString()
        };

        try {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Submitting...';

            if (n8nWebhookUrl === 'YOUR_N8N_WEBHOOK_URL_HERE') {
                console.warn('NOTE: Webhook URL is not set. Simulating a successful submission.');
                // Simulate network delay if URL isn't set yet
                await new Promise(resolve => setTimeout(resolve, 800));
            } else {
                // Send the actual POST request to n8n
                const response = await fetch(n8nWebhookUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
            }

            // Success UI changes
            form.style.display = 'none';
            successMessage.style.display = 'block';

            // If inside telegram app, automatically close it after a few seconds
            if (window.Telegram && window.Telegram.WebApp) {
                setTimeout(() => {
                    window.Telegram.WebApp.close();
                }, 3000); // closes 3 seconds after success message
            }

        } catch (error) {
            console.error('Error submitting form:', error);
            alert('There was an error submitting the form. Please check your webhook URL and try again.');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Generate Test';
        }
    });
});



