document.addEventListener('DOMContentLoaded', function () {
    // First modify all existing data-src attributes in the HTML
    const videoElements = document.querySelectorAll('.video-item');

    videoElements.forEach(item => {
        let currentSrc = item.getAttribute('data-src');
        // Check if the URL already has parameters
        if (currentSrc.includes('?')) {
            currentSrc += '&rel=0&modestbranding=1';
        } else {
            currentSrc += '?rel=0&modestbranding=1';
        }
        item.setAttribute('data-src', currentSrc);

        // Also update any already loaded iframe src attributes
        const iframe = item.querySelector('iframe');
        if (iframe.src && iframe.src !== '') {
            if (iframe.src.includes('?')) {
                iframe.src = iframe.src + '&rel=0&modestbranding=1';
            } else {
                iframe.src = iframe.src + '?rel=0&modestbranding=1';
            }
        }
    });

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // Video carousel functionality
    const videoContainer = document.getElementById('videoContainer');
    const videoItems = Array.from(document.querySelectorAll('.video-item'));
    const prevBtn = document.getElementById('prevVideo');
    const nextBtn = document.getElementById('nextVideo');
    const indicatorsContainer = document.querySelector('.video-indicators');

    let currentIndex = 0;

    // Create indicators
    if (videoItems.length > 0 && indicatorsContainer) {
        videoItems.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.classList.add('indicator');
            if (index === 0) dot.classList.add('active');
            dot.addEventListener('click', () => navigateTo(index));
            indicatorsContainer.appendChild(dot);
        });
    }

    // Initialize the carousel
    function updateCarousel() {
        videoItems.forEach((item, index) => {
            item.classList.remove('active', 'prev', 'next');

            // Load iframe source only when needed
            const iframe = item.querySelector('iframe');
            const src = item.getAttribute('data-src');

            if (index === currentIndex) {
                item.classList.add('active');
                if (iframe.src !== src) iframe.src = src;
            } else if (index === currentIndex - 1 || (currentIndex === 0 && index === videoItems.length - 1)) {
                item.classList.add('prev');
                if (iframe.src !== src && videoItems.length > 2) iframe.src = src;
            } else if (index === currentIndex + 1 || (currentIndex === videoItems.length - 1 && index === 0)) {
                item.classList.add('next');
                if (iframe.src !== src && videoItems.length > 2) iframe.src = src;
            } else {
                iframe.src = '';
            }
        });

        // Update indicators
        document.querySelectorAll('.indicator').forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
    }

    function navigateNext() {
        currentIndex = (currentIndex + 1) % videoItems.length;
        updateCarousel();
    }

    function navigatePrev() {
        currentIndex = (currentIndex - 1 + videoItems.length) % videoItems.length;
        updateCarousel();
    }

    function navigateTo(index) {
        currentIndex = index;
        updateCarousel();
    }

    // Only add event listeners if the buttons exist
    if (prevBtn) {
        prevBtn.addEventListener('click', navigatePrev);
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', navigateNext);
    }

    // Initialize carousel only if elements exist
    if (videoItems.length > 0) {
        updateCarousel();
    }

    // Smart dropdown alignment for Updates
    const updatesBtn = document.querySelector('.updates-btn');
    const updatesDropdown = document.querySelector('.updates-dropdown');

    if (updatesBtn && updatesDropdown) {
        function positionDropdown() {
            // Reset any previous transform
            updatesDropdown.style.transform = '';

            // Get the button's position relative to the viewport
            const buttonRect = updatesBtn.getBoundingClientRect();
            const dropdownRect = updatesDropdown.getBoundingClientRect();
            const viewportWidth = window.innerWidth;

            // Calculate the overflow
            const overflowRight = dropdownRect.right - viewportWidth;
            const overflowLeft = dropdownRect.left;

            let shift = 0;
            if (overflowRight > 0) {
                shift = -overflowRight - 8; // 8px padding
            } else if (overflowLeft < 0) {
                shift = -overflowLeft + 8; // 8px padding
            }
            if (shift !== 0) {
                updatesDropdown.style.transform = `translateX(${shift}px)`;
            } else {
                updatesDropdown.style.transform = '';
            }
        }

        updatesBtn.addEventListener('click', function () {
            // Small delay to ensure dropdown is visible before positioning
            setTimeout(positionDropdown, 10);
        });

        // Also handle window resize to reposition dropdown if needed
        window.addEventListener('resize', function () {
            if (updatesDropdown.classList.contains('show')) {
                positionDropdown();
            }
        });
    }

    // Generic timeline progress functionality - can be overridden by page-specific scripts
    function updateTimelineProgress() {
        const timelineProgress = document.getElementById('timeline-progress');

        if (!timelineProgress) {
            return;
        }

        // Default timeline configuration (Call for Papers)
        const milestones = [
            new Date('2025-07-09'), // Submissions Open
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