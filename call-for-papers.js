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
            progress = 65 + (phaseProgress * 0.25); // 50% to 75%
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