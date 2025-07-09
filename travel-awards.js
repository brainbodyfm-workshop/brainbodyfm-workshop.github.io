document.addEventListener('DOMContentLoaded', function () {
    // Travel Awards specific timeline progress functionality
    function updateTimelineProgress() {
        const timelineProgress = document.getElementById('timeline-progress');

        if (!timelineProgress) {
            return;
        }

        // Travel Awards specific milestone dates (TBD dates)
        const milestones = [
            new Date('2025-09-01'), // Applications Open (estimated)
            new Date('2025-10-15'), // Application Deadline (estimated)
            new Date('2025-11-01'), // Award Notification (estimated)
            new Date('2025-12-06')  // Workshop
        ];

        // Temporarily simulate next week (July 16, 2025) for testing
        const now = new Date('2025-07-16'); // Simulate next week
        // const now = new Date(); // Uncomment this line to use real current date
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
        }, 200);
    }

    // Initialize timeline progress with a delay to ensure DOM is ready
    setTimeout(() => {
        updateTimelineProgress();
    }, 1000);
}); 