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
    const studentIdGroup = document.getElementById('studentIdGroup');
    const rollNoSearch = document.getElementById('rollNoSearch');
    const rollNoList = document.getElementById('rollNoList');

    const AVAILABLE_ROLL_NOS = [
        "A2510S0001", "A2510M0002", "A2510M0003", "A2510M0004", "A2510M0005",
        "A2510M0006", "A2510M0007", "A2510M0008", "A2510H0009", "A2510H0010",
        "A2510M0011", "A2510S0012", "A2510M0013", "A2510M0014", "A2510M0015",
        "A2510S0016", "A2510H0017", "A2510M0018", "A2510M0019", "A2510M0020",
        "A2510M0021", "A2510H0022"
    ];

    function renderRollNumbers(filterText = '') {
        rollNoList.innerHTML = '';
        const lowercaseFilter = filterText.toLowerCase();

        const filtered = AVAILABLE_ROLL_NOS.filter(roll =>
            roll.toLowerCase().includes(lowercaseFilter)
        );

        if (filtered.length === 0) {
            rollNoList.innerHTML = '<div style="padding: 10px; color: #666; font-size: 14px;">No matching roll numbers found.</div>';
            return;
        }

        filtered.forEach(roll => {
            const label = document.createElement('label');
            label.className = 'rollno-label';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.name = 'selectedRollNos';
            checkbox.value = roll;

            const span = document.createElement('span');
            span.textContent = roll;

            label.appendChild(checkbox);
            label.appendChild(span);
            rollNoList.appendChild(label);
        });
    }

    renderRollNumbers();

    rollNoSearch.addEventListener('input', (e) => {
        // Keep checked state for currently visible items is tricky if we re-render entirely,
        // so a better approach for simple filtering is to just hide/show existing labels.
        const filter = e.target.value.toLowerCase();
        const labels = rollNoList.querySelectorAll('.rollno-label');

        let visibleCount = 0;
        labels.forEach(label => {
            const text = label.querySelector('span').textContent.toLowerCase();
            if (text.includes(filter)) {
                label.style.display = 'flex';
                visibleCount++;
            } else {
                label.style.display = 'none';
            }
        });

        // Remove old 'no matches' message if any
        const emptyMsg = rollNoList.querySelector('.empty-msg');
        if (emptyMsg) emptyMsg.remove();

        if (visibleCount === 0) {
            const msg = document.createElement('div');
            msg.className = 'empty-msg';
            msg.style.padding = '10px';
            msg.style.color = '#666';
            msg.style.fontSize = '14px';
            msg.textContent = 'No matching roll numbers found.';
            rollNoList.appendChild(msg);
        }
    });

    const form = document.getElementById('testForm');
    const submitBtn = document.getElementById('submitBtn');
    const successMessage = document.getElementById('successMessage');

    const taxonomyContainer = document.getElementById('taxonomyContainer');

    const TAXONOMY = {
        "FD": {
            "FD_01": ["FD_01_A", "FD_01_B"],
            "FD_02": ["FD_02_A", "FD_02_B"],
            "FD_03": ["FD_03_A", "FD_03_B"]
        },
        "QE": {},
        "RN": {},
        "LE": {}
    };

    function renderTaxonomy() {
        if (!taxonomyContainer) return;
        taxonomyContainer.innerHTML = '';

        for (const [chapter, microConcepts] of Object.entries(TAXONOMY)) {
            const chapterDiv = document.createElement('div');
            chapterDiv.className = 'taxonomy-item';

            const chapterLabel = document.createElement('label');
            chapterLabel.className = 'taxonomy-label';
            const chapterCheckbox = document.createElement('input');
            chapterCheckbox.type = 'checkbox';
            chapterCheckbox.value = chapter;
            chapterCheckbox.dataset.type = 'chapter';

            const chapterText = document.createElement('span');
            chapterText.textContent = `Chapter: ${chapter}`;
            chapterText.style.fontWeight = 'bold';

            chapterLabel.appendChild(chapterCheckbox);
            chapterLabel.appendChild(chapterText);
            chapterDiv.appendChild(chapterLabel);

            const microContainer = document.createElement('div');
            microContainer.className = 'taxonomy-children';
            microContainer.style.display = 'none';
            chapterDiv.appendChild(microContainer);

            chapterCheckbox.addEventListener('change', (e) => {
                microContainer.style.display = e.target.checked ? 'block' : 'none';
                if (!e.target.checked) {
                    const childCheckboxes = microContainer.querySelectorAll('input[type="checkbox"]');
                    childCheckboxes.forEach(cb => cb.checked = false);
                    const numInputs = microContainer.querySelectorAll('input[type="number"]');
                    numInputs.forEach(input => input.value = '');
                    const childContainers = microContainer.querySelectorAll('.taxonomy-children, .question-input-group');
                    childContainers.forEach(c => c.style.display = 'none');
                }
            });

            for (const [micro, nanoConcepts] of Object.entries(microConcepts)) {
                const microDiv = document.createElement('div');
                microDiv.className = 'taxonomy-item';

                const microLabel = document.createElement('label');
                microLabel.className = 'taxonomy-label';
                const microCheckbox = document.createElement('input');
                microCheckbox.type = 'checkbox';
                microCheckbox.value = micro;
                microCheckbox.dataset.chapter = chapter;
                microCheckbox.dataset.type = 'micro';

                const microText = document.createElement('span');
                microText.textContent = `Micro-concept: ${micro}`;

                microLabel.appendChild(microCheckbox);
                microLabel.appendChild(microText);
                microDiv.appendChild(microLabel);

                const nanoContainer = document.createElement('div');
                nanoContainer.className = 'taxonomy-children';
                nanoContainer.style.display = 'none';
                microDiv.appendChild(nanoContainer);

                microCheckbox.addEventListener('change', (e) => {
                    nanoContainer.style.display = e.target.checked ? 'block' : 'none';
                    if (!e.target.checked) {
                        const childCheckboxes = nanoContainer.querySelectorAll('input[type="checkbox"]');
                        childCheckboxes.forEach(cb => cb.checked = false);
                        const numInputs = nanoContainer.querySelectorAll('input[type="number"]');
                        numInputs.forEach(input => input.value = '');
                        const childContainers = nanoContainer.querySelectorAll('.question-input-group');
                        childContainers.forEach(c => c.style.display = 'none');
                    }
                });

                nanoConcepts.forEach(nano => {
                    const nanoDiv = document.createElement('div');
                    nanoDiv.className = 'taxonomy-item';

                    const nanoLabel = document.createElement('label');
                    nanoLabel.className = 'taxonomy-label';
                    const nanoCheckbox = document.createElement('input');
                    nanoCheckbox.type = 'checkbox';
                    nanoCheckbox.value = nano;
                    nanoCheckbox.dataset.chapter = chapter;
                    nanoCheckbox.dataset.micro = micro;
                    nanoCheckbox.dataset.type = 'nano';

                    const nanoText = document.createElement('span');
                    nanoText.textContent = `Nano-concept: ${nano}`;

                    nanoLabel.appendChild(nanoCheckbox);
                    nanoLabel.appendChild(nanoText);
                    nanoDiv.appendChild(nanoLabel);

                    const questionInputGroup = document.createElement('div');
                    questionInputGroup.className = 'question-input-group';
                    questionInputGroup.style.display = 'none';

                    const qLabel = document.createElement('label');
                    qLabel.textContent = 'Number of questions:';
                    const qInput = document.createElement('input');
                    qInput.type = 'number';
                    qInput.min = '1';
                    qInput.placeholder = 'e.g. 5';
                    qInput.dataset.nano = nano;

                    questionInputGroup.appendChild(qLabel);
                    questionInputGroup.appendChild(qInput);

                    nanoDiv.appendChild(questionInputGroup);

                    nanoCheckbox.addEventListener('change', (e) => {
                        questionInputGroup.style.display = e.target.checked ? 'flex' : 'none';
                        if (!e.target.checked) {
                            qInput.value = '';
                        }
                    });

                    nanoContainer.appendChild(nanoDiv);
                });

                microContainer.appendChild(microDiv);
            }

            taxonomyContainer.appendChild(chapterDiv);
        }
    }

    renderTaxonomy();

    // Toggle specific student id input
    targetAudienceRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'specific') {
                studentIdGroup.style.display = 'flex';
            } else {
                studentIdGroup.style.display = 'none';
                // optional: clear selections when hidden
                const checkboxes = rollNoList.querySelectorAll('input[type="checkbox"]');
                checkboxes.forEach(cb => cb.checked = false);
                rollNoSearch.value = '';
                // trigger input event to reset filter
                rollNoSearch.dispatchEvent(new Event('input'));
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

        // Clear previous error styles
        document.querySelectorAll('.error-border').forEach(el => el.classList.remove('error-border'));

        const audience = document.querySelector('input[name="targetAudience"]:checked').value;

        const gradeGroup = document.getElementById('gradeGroup');
        const gradeChecked = document.querySelectorAll('input[name="studentGrade"]:checked');
        const grades = Array.from(gradeChecked).map(cb => cb.value);
        if (grades.length === 0) {
            gradeGroup.classList.add('error-border');
            alert("Please select at least one grade.");
            return;
        }

        const studentIdGroup = document.getElementById('studentIdGroup');
        const rollNoListElem = document.getElementById('rollNoList');

        let studentIds = [];
        if (audience === 'specific') {
            const selectedRolls = rollNoListElem.querySelectorAll('input[name="selectedRollNos"]:checked');
            studentIds = Array.from(selectedRolls).map(cb => cb.value);

            if (studentIds.length === 0) {
                rollNoListElem.classList.add('error-border');
                alert("Please select at least one roll number.");
                return;
            }
        }

        const selectedChapters = new Set();
        const selectedMicro = new Set();
        const selectedNano = [];
        let hasNanoSelections = false;

        const questionInputs = document.querySelectorAll('.question-input-group input[type="number"]');
        let missingQuestionCount = false;
        let missingInputs = [];

        // Track what levels have selections
        let hasChapterSelections = false;
        let hasMicroSelections = false;

        const allChapters = document.querySelectorAll('input[type="checkbox"][data-type="chapter"]');
        allChapters.forEach(cb => { if (cb.checked) hasChapterSelections = true; });

        const allMicros = document.querySelectorAll('input[type="checkbox"][data-type="micro"]');
        allMicros.forEach(cb => { if (cb.checked) hasMicroSelections = true; });

        if (!hasChapterSelections) {
            taxonomyContainer.classList.add('error-border');
            alert("Please select at least one Chapter.");
            return;
        }

        if (!hasMicroSelections) {
            taxonomyContainer.classList.add('error-border');
            alert("Please select at least one Micro-concept.");
            return;
        }

        questionInputs.forEach(input => {
            const container = input.closest('.taxonomy-item');
            const checkbox = container.querySelector('input[type="checkbox"]');

            if (checkbox && checkbox.checked) {
                const num = parseInt(input.value);
                if (isNaN(num) || num <= 0) {
                    missingQuestionCount = true;
                    missingInputs.push(input);
                } else {
                    hasNanoSelections = true;
                    const nanoId = input.dataset.nano;
                    const microId = checkbox.dataset.micro;
                    const chapterId = checkbox.dataset.chapter;

                    selectedChapters.add(chapterId);
                    selectedMicro.add(microId);

                    const nanoObj = {};
                    nanoObj[nanoId] = num;
                    selectedNano.push(nanoObj);
                }
            }
        });

        if (missingQuestionCount) {
            missingInputs.forEach(el => el.classList.add('error-border'));
            taxonomyContainer.classList.add('error-border');
            alert("Please enter a valid number of questions for all selected nano-concepts.");
            return;
        }

        if (!hasNanoSelections) {
            taxonomyContainer.classList.add('error-border');
            alert("Please select at least one Nano-concept and enter a valid number of questions.");
            return;
        }

        // Put the data together as JSON
        const payload = {
            targetAudience: audience,
            Student_ID: audience === 'specific' ? studentIds : null,
            Grade: grades,
            Chapter_ID: Array.from(selectedChapters),
            Microconcept_ID: Array.from(selectedMicro),
            Nanoconcept_ID: selectedNano,
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
