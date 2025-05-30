class BiosignalAnimation {
    constructor() {
        this.container = document.querySelector('.biosignal-background');
        this.rows = [];
        this.animationId = null;
        this.isRunning = false;

        // Configuration
        this.config = {
            rowCount: 10, // Increased from 7 to 10 for better coverage
            iconSpacing: 140, // Space between icons
            speed: 0.8, // Consistent speed for all rows
            iconSize: 100,
            rowHeight: 140,
            rowSpacing: 22, // Increased from 18 to 22 for more distance between rows
            rotation: 8, // degrees
            icons: [
                'assets/modalities/eeg.png',
                'assets/modalities/fmri.png',
                'assets/modalities/emg.png',
                'assets/modalities/meg.png',
                'assets/modalities/ecg.png',
                'assets/modalities/ieeg.png',
                'assets/modalities/wearable.png',
                'assets/modalities/calcium.png',
                'assets/modalities/microarray.png'
            ]
        };

        this.init();
    }

    init() {
        // Clear existing content
        this.container.innerHTML = '';

        // Create rows
        for (let i = 0; i < this.config.rowCount; i++) {
            this.createRow(i);
        }

        this.start();
    }

    createRow(index) {
        const row = document.createElement('div');
        row.className = 'biosignal-row-js';
        row.style.cssText = `
            position: absolute;
            width: 100%;
            height: ${this.config.rowHeight}px;
            display: flex;
            align-items: center;
            top: ${-25 + (index * this.config.rowSpacing)}%;
            transform: rotate(${this.config.rotation}deg);
            pointer-events: none;
        `;

        // Create row data with consistent speed
        const rowData = {
            element: row,
            icons: [],
            speed: this.config.speed, // Same speed for all rows
            offset: (index % 2) * (this.config.iconSpacing / 2) // Alternate offset for staggered pattern
        };

        // Calculate how many icons we need to fill the screen plus buffer
        // Account for rotation by using diagonal + extra buffer
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const diagonal = Math.sqrt(screenWidth * screenWidth + screenHeight * screenHeight);
        const rotationBuffer = diagonal * 0.6; // Buffer for rotation
        const totalWidth = diagonal + rotationBuffer;
        const iconsNeeded = Math.ceil(totalWidth / this.config.iconSpacing) + 10; // More buffer icons

        // Create icons for this row
        for (let i = 0; i < iconsNeeded; i++) {
            const iconData = this.createIcon(i, rowData.offset);
            row.appendChild(iconData.element);
            rowData.icons.push(iconData);
        }

        this.container.appendChild(row);
        this.rows.push(rowData);
    }

    createIcon(index, baseOffset) {
        const img = document.createElement('img');
        const iconSrc = this.config.icons[index % this.config.icons.length];

        img.src = iconSrc;
        img.className = 'biosignal-icon-js';
        img.alt = '';
        img.style.cssText = `
            width: ${this.config.iconSize}px;
            height: ${this.config.iconSize}px;
            object-fit: contain;
            opacity: 0.9;
            flex-shrink: 0;
            position: absolute;
            animation: none;
        `;

        // Start icons off-screen to the left with proper spacing
        const startX = -this.config.iconSpacing * 4 + baseOffset + (index * this.config.iconSpacing);

        return {
            element: img,
            currentX: startX,
            originalIndex: index,
            floatOffset: Math.random() * Math.PI * 2, // For floating animation
            floatSpeed: 0.015 + Math.random() * 0.005 // Smaller variation in float speed
        };
    }

    updatePositions() {
        const time = Date.now() * 0.001; // Convert to seconds
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;

        // Calculate the actual visible area accounting for rotation
        const diagonal = Math.sqrt(screenWidth * screenWidth + screenHeight * screenHeight);
        // Much larger reset point to ensure complete coverage
        const resetPoint = diagonal * 1.0; // Icons travel the full diagonal
        const startPoint = -this.config.iconSpacing * 5; // Starting point further off-screen

        this.rows.forEach(row => {
            row.icons.forEach(icon => {
                // Update horizontal position with consistent speed
                icon.currentX += row.speed;

                // Reset position when icon goes far enough off screen
                // Use a seamless reset that maintains the spacing pattern
                if (icon.currentX > resetPoint) {
                    // Find the leftmost icon in this row to maintain proper spacing
                    const leftmostX = Math.min(...row.icons.map(i => i.currentX));
                    icon.currentX = leftmostX - this.config.iconSpacing;
                }

                // Calculate subtle floating animation
                const floatY = Math.sin(time * icon.floatSpeed + icon.floatOffset) * 6;
                const floatScale = 1 + Math.sin(time * icon.floatSpeed + icon.floatOffset) * 0.03;

                // Apply transform
                icon.element.style.transform = `
                    translateX(${icon.currentX}px) 
                    translateY(${floatY}px) 
                    scale(${floatScale})
                `;
            });
        });
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;

        const animate = () => {
            if (!this.isRunning) return;

            this.updatePositions();
            this.animationId = requestAnimationFrame(animate);
        };

        animate();
    }

    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    handleResize() {
        // Don't stop the animation, just add more icons if needed
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const diagonal = Math.sqrt(screenWidth * screenWidth + screenHeight * screenHeight);
        const rotationBuffer = diagonal * 0.6;
        const totalWidth = diagonal + rotationBuffer;
        const iconsNeeded = Math.ceil(totalWidth / this.config.iconSpacing) + 10;

        this.rows.forEach(row => {
            // Add more icons if we don't have enough for the new screen size
            while (row.icons.length < iconsNeeded) {
                const iconData = this.createIcon(row.icons.length, row.offset);
                row.element.appendChild(iconData.element);
                row.icons.push(iconData);
            }
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const biosignalAnimation = new BiosignalAnimation();

    // Handle window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            biosignalAnimation.handleResize();
        }, 250);
    });

    // Pause animation when page is not visible (performance optimization)
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            biosignalAnimation.stop();
        } else {
            biosignalAnimation.start();
        }
    });
}); 