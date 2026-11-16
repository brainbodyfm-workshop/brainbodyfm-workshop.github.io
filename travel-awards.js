document.addEventListener('DOMContentLoaded', function () {
    // Travel Awards specific timeline progress functionality
    function updateTimelineProgress() {
        const timelineProgress = document.getElementById('timeline-progress');

        if (!timelineProgress) {
            return;
        }

        // Travel Awards specific milestone dates
        const milestones = [
            new Date('2026-08-03'), // Applications Open
            new Date('2026-09-05'), // Application Deadline
            new Date('2026-10-09'), // Award Notification
            new Date('2026-12-12')  // Workshop
        ];

        const now = new Date();

        // Markers are equal-width flex columns, so milestone i sits at (i + 0.5) / N of the
        // track. Fill to the marker we've reached, plus how far we are into the current leg.
        const N = milestones.length;
        let progress;

        if (now < milestones[0]) {
            progress = 0;                                   // nothing has happened yet
        } else if (now >= milestones[N - 1]) {
            progress = 100;                                 // past the last milestone
        } else {
            const i = milestones.findIndex(d => now < d) - 1;
            const frac = (now - milestones[i]) / (milestones[i + 1] - milestones[i]);
            progress = ((i + frac + 0.5) / N) * 100;
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