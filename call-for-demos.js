document.addEventListener('DOMContentLoaded', function () {
    // Call for Demos specific timeline progress functionality
    function updateTimelineProgress() {
        const timelineProgress = document.getElementById('timeline-progress');

        if (!timelineProgress) {
            return;
        }

        // Call for Demos specific milestone dates
        const milestones = [
            new Date('2025-07-22'), // Submissions Open
            new Date('2025-08-22'), // Submission Deadline
            new Date('2025-09-22'), // Accept/Reject Notification
            new Date('2025-12-06')  // Workshop
        ];

        // Temporarily simulate next week (July 16, 2025) for testing
        const now = new Date('2025-07-16'); // Simulate next week
        // const now = new Date(); // Uncomment this line to use real current date
        const startDate = milestones[0];
        const endDate = milestones[1]; // Progress to submission deadline

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