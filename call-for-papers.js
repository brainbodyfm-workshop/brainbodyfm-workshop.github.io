document.addEventListener('DOMContentLoaded', function () {
    // Override the main script's timeline progress function
    function updateTimelineProgress() {
        const timelineProgress = document.getElementById('timeline-progress');

        if (!timelineProgress) {
            return;
        }

        // Call for Papers specific milestone dates
        const milestones = [
            new Date('2025-07-09'), // Submissions Open
            new Date('2025-08-29'), // Submission Deadline
            new Date('2025-09-22'), // Accept/Reject Notification
            new Date('2025-10-30'), // Camera Ready Deadline
            new Date('2025-12-06')  // Workshop
        ];
        document.addEventListener('DOMContentLoaded', function () {
            // Call for Demos specific timeline progress functionality
            function updateTimelineProgress() {
                const timelineProgress = document.getElementById('timeline-progress');

                if (!timelineProgress) {
                    return;
                }

                // Call for Demos specific milestone dates
                const milestones = [
                    new Date('2025-07-15'), // Submissions Open
                    new Date('2025-09-12'), // Submission Deadline
                    new Date('2025-09-22'), // Accept/Reject Notification
                    new Date('2025-10-30'), // Camera Ready Deadline
                    new Date('2025-12-06')  // Workshop
                ];

                const now = new Date();

                // Calculate progress based on current phase
                let progress = 0;

                if (now < milestones[0]) {
                    // Before submissions open
                    progress = 0;
                } else if (now < milestones[1]) {
                    // Between submissions open and deadline (0% to 25%)
                    const totalDuration = milestones[1] - milestones[0];
                    const elapsed = now - milestones[0];
                    const phaseProgress = Math.min((elapsed / totalDuration) * 100, 100);
                    progress = (phaseProgress * 0.25); // 0% to 25%
                } else if (now < milestones[2]) {
                    // Between submission deadline and notification (25% to 50%)
                    const totalDuration = milestones[2] - milestones[1];
                    const elapsed = now - milestones[1];
                    const phaseProgress = Math.min((elapsed / totalDuration) * 100, 100);
                    progress = 25 + (phaseProgress * 0.25); // 25% to 50%
                } else if (now < milestones[3]) {
                    // Between notification and workshop (50% to 75%)
                    const totalDuration = milestones[3] - milestones[2];
                    const elapsed = now - milestones[2];
                    const phaseProgress = Math.min((elapsed / totalDuration) * 100, 100);
                    progress = 45 + (phaseProgress * 0.2); // 50% to 70%
                } else if (now < milestones[4]) {
                    // Between notification and workshop (50% to 75%)
                    const totalDuration = milestones[4] - milestones[3];
                    const elapsed = now - milestones[3];
                    const phaseProgress = Math.min((elapsed / totalDuration) * 100, 100);
                    progress = 75 + (phaseProgress * 0.25); // 50% to 75%
                } else {
                    // After workshop
                    progress = 100;
                }

                // Set initial width to 0 and animate to calculated progress
                timelineProgress.style.width = '0%';

                setTimeout(() => {
                    timelineProgress.style.width = progress + '%';
                }, 100);
            }

            // Override the main script's timeline progress with a longer delay
            setTimeout(() => {
                updateTimelineProgress();
            }, 1500); // Longer delay to ensure it runs after the main script
        });
        const now = new Date();

        // Calculate progress based on current phase
        let progress = 0;

        if (now < milestones[0]) {
            // Before submissions open
            progress = 0;
        } else if (now < milestones[1]) {
            // Between submissions open and deadline (0% to 25%)
            const totalDuration = milestones[1] - milestones[0];
            const elapsed = now - milestones[0];
            const phaseProgress = Math.min((elapsed / totalDuration) * 100, 100);
            progress = 10 + (phaseProgress * 0.25); // 0% to 25%
        } else if (now < milestones[2]) {
            // Between submission deadline and notification (25% to 50%)
            const totalDuration = milestones[2] - milestones[1];
            const elapsed = now - milestones[1];
            const phaseProgress = Math.min((elapsed / totalDuration) * 100, 100);
            progress = 35 + (phaseProgress * 0.25); // 25% to 50%
        } else if (now < milestones[3]) {
            // Between notification and workshop (50% to 75%)
            const totalDuration = milestones[3] - milestones[2];
            const elapsed = now - milestones[2];
            const phaseProgress = Math.min((elapsed / totalDuration) * 100, 100);
            progress = 50 + (phaseProgress * 0.2); // 50% to 70%
        } else if (now < milestones[4]) {
            // Between notification and workshop (50% to 75%)
            const totalDuration = milestones[4] - milestones[3];
            const elapsed = now - milestones[3];
            const phaseProgress = Math.min((elapsed / totalDuration) * 100, 100);
            progress = 85 + (phaseProgress * 0.15); // 70% to 85%
        } else {
            // After workshop
            progress = 100;
        }

        // Set initial width to 0 and animate to calculated progress
        timelineProgress.style.width = '0%';

        setTimeout(() => {
            timelineProgress.style.width = progress + '%';
        }, 100);
    }

    // Override the main script's timeline progress with a longer delay
    setTimeout(() => {
        updateTimelineProgress();
    }, 1500); // Longer delay to ensure it runs after the main script

    // Load and display accepted papers from CSV
    function loadAcceptedPapers() {
        fetch('brainbodyfm_accepted_submissions.csv')
            .then(response => response.text())
            .then(csvText => {
                const lines = csvText.split('\n');
                const headers = lines[0].split(',');

                const spotlightPapers = [];
                const posterPapers = [];

                // Parse CSV data (skip header row)
                for (let i = 1; i < lines.length; i++) {
                    if (lines[i].trim()) {
                        const values = parseCSVLine(lines[i]);
                        if (values.length >= 5) {
                            const paper = {
                                title: values[0],
                                authors: values[3],
                                openReviewLink: values[2],
                                status: values[4]
                            };

                            if (paper.status === 'Spotlight') {
                                spotlightPapers.push(paper);
                            } else if (paper.status === 'Poster') {
                                posterPapers.push(paper);
                            }
                        }
                    }
                }

                // Display spotlight papers
                const spotlightList = document.getElementById('spotlight-papers');
                if (spotlightList) {
                    spotlightPapers.forEach(paper => {
                        const li = document.createElement('li');
                        li.className = 'mb-2';
                        li.innerHTML = `
                            <strong>${paper.title}</strong><br>
                            <em>${paper.authors}</em> - 
                            <a href="${paper.openReviewLink}" target="_blank">See on OpenReview</a>
                        `;
                        spotlightList.appendChild(li);
                    });
                }

                // Display poster papers
                const posterList = document.getElementById('poster-papers');
                if (posterList) {
                    posterPapers.forEach(paper => {
                        const li = document.createElement('li');
                        li.className = 'mb-2';
                        li.innerHTML = `
                            <strong>${paper.title}</strong><br>
                            <em>${paper.authors}</em> - 
                            <a href="${paper.openReviewLink}" target="_blank">See on OpenReview</a>
                        `;
                        posterList.appendChild(li);
                    });
                }
            })
            .catch(error => {
                console.error('Error loading accepted papers:', error);
            });
    }

    // Helper function to parse CSV line (handles quoted fields with commas)
    function parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];

            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }

        result.push(current.trim());
        return result;
    }

    // Load papers when page loads
    loadAcceptedPapers();
}); 