// Brain animation with Three.js
let scene, camera, renderer;
let brainMesh;
let clock = new THREE.Clock();
// Add quality control
let qualityLevel = 0.5; // Between 0 and 1, adjusts complexity

function initBrain() {
    // Comment out FPS display creation and setup
    /*
    fpsDisplay = document.createElement('div');
    fpsDisplay.style.position = 'absolute';
    fpsDisplay.style.top = '10px';
    fpsDisplay.style.left = '10px';
    fpsDisplay.style.color = 'white';
    fpsDisplay.style.backgroundColor = 'rgba(0,0,0,0.5)';
    fpsDisplay.style.padding = '5px';
    fpsDisplay.style.borderRadius = '3px';
    fpsDisplay.style.fontFamily = 'monospace';
    fpsDisplay.style.zIndex = '100';
    document.getElementById('brain-container').appendChild(fpsDisplay);
    */

    // Create scene
    scene = new THREE.Scene();

    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / 400, 0.1, 1000);
    camera.position.z = 1.8;

    // Create renderer with improved settings
    const container = document.getElementById('brain-container');
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });
    renderer.setSize(window.innerWidth, 400);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Enable tone mapping for better lighting
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    container.appendChild(renderer.domElement);

    // OPTIMIZATION: Reduce geometry complexity - from 256 segments to 128 or fewer
    const segmentCount = Math.max(32, Math.floor(128 * qualityLevel));
    const geometry = new THREE.SphereGeometry(1, segmentCount, segmentCount);

    // Store original positions for animation
    const originalPositions = new Float32Array(geometry.attributes.position.array.length);
    originalPositions.set(geometry.attributes.position.array);

    // Restored colorful material
    const material = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 0.6,
        roughness: 0.2,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
        vertexColors: true,
        envMapIntensity: 1.2
    });

    // Create color attribute for the geometry with vibrant gradient
    const count = geometry.attributes.position.count;
    const colors = new Float32Array(count * 3);

    // Return to vibrant colors (cyan, pink, yellow)
    // const colorA = new THREE.Color(0xff8cc6); // Light brain pink
    // const colorB = new THREE.Color(0xff8cc6); // Medium brain pink 
    // const colorC = new THREE.Color(0xff6699); // Deep brain pink

    const colorA = new THREE.Color(0x1acbcb); // Cyan
    const colorB = new THREE.Color(0xe5197e); // Pink
    const colorC = new THREE.Color(0xe6cc18); // Yellow

    for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const x = geometry.attributes.position.array[i3];
        const y = geometry.attributes.position.array[i3 + 1];
        const z = geometry.attributes.position.array[i3 + 2];

        // Create an initial color gradient based on position
        const color = new THREE.Color().copy(colorA);
        color.lerp(colorB, 0.5 + 0.5 * Math.sin(x * 3));
        color.lerp(colorC, 0.5 + 0.5 * Math.cos(y * 3));

        colors[i3] = color.r;
        colors[i3 + 1] = color.g;
        colors[i3 + 2] = color.b;
    }

    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Create brain mesh
    brainMesh = new THREE.Mesh(geometry, material);
    scene.add(brainMesh);

    // OPTIMIZATION: Simplified lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    // Main light
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
    mainLight.position.set(1, 1, 2);
    scene.add(mainLight);

    // OPTIMIZATION: Only one additional light instead of two
    const rimLight = new THREE.DirectionalLight(0xffffdd, 0.7);
    rimLight.position.set(-1, -1, -1);
    scene.add(rimLight);

    // Handle window resize
    window.addEventListener('resize', onWindowResize);

    // OPTIMIZATION: Reduce number of seed points based on quality
    const numSeeds = Math.floor(30 + 90 * qualityLevel); // Between 30 and 120 based on quality

    // Pre-calculate seed points
    const foldSeeds = [];
    for (let i = 0; i < numSeeds; i++) {
        // Create random points on sphere surface
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const x = Math.sin(phi) * Math.cos(theta);
        const y = Math.sin(phi) * Math.sin(theta);
        const z = Math.cos(phi);

        foldSeeds.push({
            position: new THREE.Vector3(x, y, z),
            strength: 0.03 + Math.random() * 0.03,
            frequency: 6 + Math.random() * 10,
            phase: Math.random() * Math.PI * 2,
            speed: 0.1 + Math.random() * 0.3
        });
    }

    // OPTIMIZATION: Create a pool of Vector3 objects to avoid garbage collection
    const vectorPool = new THREE.Vector3();

    // OPTIMIZATION: Pre-calculate frequency values for global waves
    const waveFrequencies = {
        global: { x: 8, y: 8, z: 8 },
        secondary: { x: 7, y: 7, z: 7 },
        tertiary: { x: 9, y: 9, z: 9 },
        quaternary: { x: 12, y: 11, z: 10 }
    };

    // OPTIMIZATION: More efficient brain fold calculation
    function calculateBrainFolds(point, time) {
        let totalDisplacement = 0;

        // Reuse vector object from pool
        vectorPool.set(point.x, point.y, point.z).normalize();
        const pos = vectorPool;

        // OPTIMIZATION: Limit iterations for lower quality levels
        const seedLimit = Math.ceil(foldSeeds.length * qualityLevel);

        // Primary fold pattern - process every Nth seed based on quality
        const seedStep = qualityLevel < 0.5 ? 2 : 1;
        for (let i = 0; i < seedLimit; i += seedStep) {
            const seed = foldSeeds[i];
            const distance = pos.distanceTo(seed.position);

            // Skip calculations for distant seeds
            if (distance > 0.8) continue;

            const ridgePattern = Math.sin(
                seed.frequency * distance +
                seed.phase +
                time * seed.speed
            ) * Math.exp(-distance * 3);

            totalDisplacement += ridgePattern * seed.strength;
        }

        // OPTIMIZATION: Simplified wave calculations - precompute some terms
        const timeFactors = {
            g1: time * 0.5,
            g2: time * 0.4,
            s1: time * 0.7,
            s2: time * 0.6,
            t1: time * 0.3,
            t2: time * 0.5,
            q1: time * 0.4,
            q2: time * 0.8
        };

        // OPTIMIZATION: Combined wave calculations with fewer operations
        const posXY = pos.x + pos.y;
        const posYZ = pos.y + pos.z;
        const posZX = pos.z + pos.x;

        const freq = waveFrequencies;

        // Use fewer wave systems when quality is low
        if (qualityLevel > 0.3) {
            // Add global wave patterns
            const globalWaves = 0.015 * Math.sin(pos.x * freq.global.x + pos.y * freq.global.y + timeFactors.g1) *
                Math.cos(pos.z * freq.global.z + pos.x * freq.global.x + timeFactors.g2);

            // Add secondary wave system
            const secondaryWaves = 0.018 * Math.sin(pos.y * freq.secondary.y + pos.z * freq.secondary.z + timeFactors.s1) *
                Math.cos(pos.x * freq.secondary.x + pos.y * freq.secondary.y + timeFactors.s2);

            totalDisplacement += globalWaves + secondaryWaves;

            if (qualityLevel > 0.7) {
                // Add tertiary wave system for higher quality
                const tertiaryWaves = 0.012 * Math.sin(pos.z * freq.tertiary.z + pos.x * freq.tertiary.x + timeFactors.t1) *
                    Math.sin(pos.y * freq.tertiary.y + pos.z * freq.tertiary.z + timeFactors.t2);

                // Add quaternary wave system only at highest quality
                const quaternaryWaves = 0.01 * Math.sin(pos.x * freq.quaternary.x + pos.z * freq.quaternary.z + timeFactors.q1) *
                    Math.cos(pos.y * freq.quaternary.y + pos.x * freq.quaternary.x + timeFactors.q2);

                totalDisplacement += tertiaryWaves + quaternaryWaves;
            }
        } else {
            // Simplified waves for low quality
            const simpleWaves = 0.02 * Math.sin(posXY * 7 + timeFactors.g1) *
                Math.cos(posZX * 7 + timeFactors.g2);
            totalDisplacement += simpleWaves;
        }

        return totalDisplacement;
    }

    // OPTIMIZATION: Track frame count to update less frequently on slower devices
    let colorUpdateCounter = 0;
    let normalsUpdateCounter = 0;

    // Function to create smooth waves and update colors
    function animate() {
        requestAnimationFrame(animate);

        // Comment out FPS counter update
        /*
        frameCount++;
        const currentTime = performance.now();
        const elapsedTime = currentTime - lastTime;

        if (elapsedTime >= 1000) {
            const fps = Math.round((frameCount * 1000) / elapsedTime);
            fpsDisplay.textContent = `FPS: ${fps}`;

            // OPTIMIZATION: Adjust quality based on performance
            if (fps < 15 && qualityLevel > 0.2) {
                qualityLevel = Math.max(0.2, qualityLevel - 0.1);
                console.log("Reducing quality to:", qualityLevel);
            } else if (fps > 40 && qualityLevel < 1.0) {
                qualityLevel = Math.min(1.0, qualityLevel + 0.1);
                console.log("Increasing quality to:", qualityLevel);
            }

            frameCount = 0;
            lastTime = currentTime;
        }
        */

        const time = clock.getElapsedTime();

        // Update the positions for wave effect
        const positions = geometry.attributes.position.array;
        const colors = geometry.attributes.color.array;

        colorUpdateCounter++;
        normalsUpdateCounter++;

        // OPTIMIZATION: Update every vertex for positions, but possibly skip some for colors
        const updateColors = colorUpdateCounter >= (qualityLevel < 0.5 ? 3 : 1);
        if (updateColors) colorUpdateCounter = 0;

        // OPTIMIZATION: Use step increment to process fewer vertices on low-end devices
        const vertexStep = qualityLevel < 0.3 ? 3 : 1;

        for (let i = 0; i < positions.length; i += 3 * vertexStep) {
            const x = originalPositions[i];
            const y = originalPositions[i + 1];
            const z = originalPositions[i + 2];

            const point = { x, y, z };

            // Apply brain fold displacement pattern
            const displacement = calculateBrainFolds(point, time);

            // Apply displacement in the radial direction
            const scale = 1 + displacement;
            positions[i] = x * scale;
            positions[i + 1] = y * scale;
            positions[i + 2] = z * scale;

            // Update colors less frequently for optimization
            if (updateColors) {
                const i3 = i;

                // Simplified color calculation for better performance
                const t = (x + y + z) * 0.3 + time * 0.2;
                const sinT = Math.sin(t + x + displacement * 3);
                const cosT = Math.cos(t * 0.7 + y * 2.0 + displacement * 5);

                // Cheaper color interpolation
                const r = colorA.r + (colorB.r - colorA.r) * (0.5 + 0.5 * sinT) +
                    (colorC.r - colorA.r) * (0.5 + 0.5 * cosT);
                const g = colorA.g + (colorB.g - colorA.g) * (0.5 + 0.5 * sinT) +
                    (colorC.g - colorA.g) * (0.5 + 0.5 * cosT);
                const b = colorA.b + (colorB.b - colorA.b) * (0.5 + 0.5 * sinT) +
                    (colorC.b - colorA.b) * (0.5 + 0.5 * cosT);

                colors[i3] = Math.max(0, Math.min(1, r));
                colors[i3 + 1] = Math.max(0, Math.min(1, g));
                colors[i3 + 2] = Math.max(0, Math.min(1, b));
            }
        }

        // Update the geometry
        geometry.attributes.position.needsUpdate = true;

        if (updateColors) {
            geometry.attributes.color.needsUpdate = true;
        }

        // OPTIMIZATION: Compute normals less frequently at lower quality levels
        if (normalsUpdateCounter >= (qualityLevel < 0.5 ? 5 : 2)) {
            geometry.computeVertexNormals();
            normalsUpdateCounter = 0;
        }

        // Rotate the brain slowly
        brainMesh.rotation.y = time * 0.1;
        brainMesh.rotation.z = time * 0.05;

        renderer.render(scene, camera);
    }

    // Start animation
    animate();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / 400;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, 400);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
    // Check if THREE.js is loaded
    if (typeof THREE !== 'undefined') {
        initBrain();
    } else {
        console.error('THREE.js library not loaded.');
    }
}); 