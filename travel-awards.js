document.addEventListener('DOMContentLoaded', function () {
    // Travel Awards specific timeline progress functionality
    function updateTimelineProgress() {
        const timelineProgress = document.getElementById('timeline-progress');

        if (!timelineProgress) {
            return;
        }

        // Travel Awards specific milestone dates
        const milestones = [
            new Date('2025-07-09'), // Applications Open
            new Date('2025-08-22'), // Application Deadline
            new Date('2025-10-01'), // Award Notification (estimated)
            new Date('2025-12-06')  // Workshop
        ];

        const now = new Date();
        const startDate = milestones[0];
        const endDate = milestones[1]; // Progress to application deadline

        // Calculate progress percentage
        let progress = 0;
        if (now >= startDate) {
            if (now >= endDate) {
                progress = 100;
            } else {
                const totalDuration = endDate - startDate;
                const elapsed = now - startDate;
                progress = Math.min((elapsed / totalDuration) * 100, 100);
            }
        }

        // Set initial width to 0 and animate to calculated progress
        timelineProgress.style.width = '0%';
        setTimeout(() => {
            timelineProgress.style.width = progress + '%';
        }, 100);
    }

    // Initialize timeline progress with a delay to ensure DOM is ready
    setTimeout(() => {
        updateTimelineProgress();
    }, 1000);
}); 