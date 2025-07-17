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
        }, 200);
    }

    // Dynamically update milestone classes and statuses
    function updateTimelineMilestones() {
        // Desktop timeline
        const desktopMilestones = document.querySelectorAll('.timeline-milestones .timeline-milestone');
        // Mobile timeline
        const mobileMilestones = document.querySelectorAll('.mobile-timeline-list .mobile-milestone');

        // Travel Awards milestone dates
        const milestoneDates = [
            new Date('2025-07-15'), // Applications Open
            new Date('2025-08-22'), // Application Deadline
            new Date('2025-10-01'), // Award Notification
            new Date('2025-12-06')  // Workshop
        ];
        const now = new Date();
        let currentIdx = -1;
        for (let i = 0; i < milestoneDates.length; i++) {
            if (now < milestoneDates[i]) {
                currentIdx = i;
                break;
            }
        }
        if (currentIdx === -1) currentIdx = milestoneDates.length; // All completed

        // Update desktop timeline
        desktopMilestones.forEach((el, i) => {
            el.classList.remove('completed', 'current');
            const marker = el.querySelector('.milestone-marker');
            marker.classList.remove('completed', 'current', 'upcoming');
            const status = el.querySelector('.milestone-status');
            if (i < currentIdx) {
                el.classList.add('completed');
                marker.classList.add('completed');
                if (status) status.textContent = 'Completed';
            } else if (i === currentIdx) {
                el.classList.add('current');
                marker.classList.add('current');
                if (status) status.textContent = 'Upcoming';
            } else {
                marker.classList.add('upcoming');
                if (status) status.textContent = 'Upcoming';
            }
        });

        // Update mobile timeline
        mobileMilestones.forEach((el, i) => {
            el.classList.remove('completed', 'current');
            const status = el.querySelector('.mobile-milestone-status');
            if (i < currentIdx) {
                el.classList.add('completed');
                if (status) status.textContent = 'Completed';
            } else if (i === currentIdx) {
                el.classList.add('current');
                if (status) status.textContent = 'Upcoming';
            } else {
                if (status) status.textContent = 'Upcoming';
            }
        });
    }

    // Initialize timeline progress and milestone classes
    setTimeout(() => {
        updateTimelineProgress();
        updateTimelineMilestones();
    }, 1000);
}); 