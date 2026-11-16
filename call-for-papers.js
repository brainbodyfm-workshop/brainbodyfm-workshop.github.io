document.addEventListener('DOMContentLoaded', function () {
    // Override the main script's timeline progress function
    function updateTimelineProgress() {
        const timelineProgress = document.getElementById('timeline-progress');

        if (!timelineProgress) {
            return;
        }

        // Call for Papers specific milestone dates
        const milestones = [
            new Date('2026-08-03'), // Submissions Open
            new Date('2026-09-05'), // Submission Deadline
            new Date('2026-09-29'), // Accept/Reject Notification
            new Date('2026-11-06'), // Camera Ready Deadline
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

    // Load and display accepted papers from CSV.
    // Each edition folder (root = current, 2025/, ...) ships its own
    // brainbodyfm_accepted_submissions.csv. Columns are looked up by header name:
    //   Title, Abstract, OpenReview Link, Authors, Status (Spotlight | Poster),
    //   Modality (optional, several values separated by ";").
    // Empty Authors / OpenReview Link / Modality are simply not shown; the section
    // stays hidden until the CSV contains at least one paper.
    const STATUS_LISTS = { Spotlight: 'spotlight-papers', Poster: 'poster-papers' };

    let allPapers = [];
    let activeModality = null; // null = all modalities
    let searchQuery = '';

    function loadAcceptedPapers() {
        const section = document.getElementById('accepted-papers');

        fetch('brainbodyfm_accepted_submissions.csv')
            .then(response => {
                if (!response.ok) {
                    throw new Error('HTTP ' + response.status);
                }
                return response.text();
            })
            .then(csvText => {
                const lines = csvText.split('\n');
                const headers = parseCSVLine(lines[0].replace(/^﻿/, ''));
                const col = name => headers.indexOf(name);
                const get = (values, name) => (col(name) >= 0 ? values[col(name)] || '' : '');

                for (let i = 1; i < lines.length; i++) {
                    if (!lines[i].trim()) {
                        continue;
                    }
                    const values = parseCSVLine(lines[i]);
                    const paper = {
                        title: get(values, 'Title'),
                        abstract: get(values, 'Abstract'),
                        openReviewLink: get(values, 'OpenReview Link'),
                        authors: get(values, 'Authors'),
                        status: get(values, 'Status'),
                        modalities: get(values, 'Modality').split(';').map(m => m.trim()).filter(Boolean)
                    };
                    if (paper.title && STATUS_LISTS[paper.status]) {
                        paper.searchText = normalize(
                            [paper.title, paper.authors, paper.abstract, paper.modalities.join(' ')].join(' ')
                        );
                        allPapers.push(paper);
                    }
                }

                // Alphabetical by title, independent of CSV row order
                allPapers.sort((a, b) => a.title.localeCompare(b.title, 'en', { sensitivity: 'base' }));

                if (section && allPapers.length > 0) {
                    section.style.display = '';
                }

                setupFilters();
                renderPapers();
            })
            .catch(error => {
                console.error('Error loading accepted papers:', error);
            });
    }

    // Lowercase and strip accents so "jose" matches "José"
    function normalize(text) {
        return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
    }

    function setupFilters() {
        const searchInput = document.getElementById('paper-search');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                searchQuery = normalize(searchInput.value.trim());
                renderPapers();
            });
        }

        const filterBar = document.getElementById('modality-filters');
        if (!filterBar) {
            return;
        }

        // Count papers per modality, most common first
        const counts = {};
        allPapers.forEach(paper => paper.modalities.forEach(m => {
            counts[m] = (counts[m] || 0) + 1;
        }));
        const modalities = Object.keys(counts).sort((a, b) => counts[b] - counts[a] || a.localeCompare(b));

        if (modalities.length === 0) {
            filterBar.style.display = 'none';
            return;
        }

        const makeButton = (label, value, count) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'btn btn-sm rounded-pill modality-filter';
            button.dataset.modality = value === null ? '' : value;
            button.textContent = count === undefined ? label : `${label} (${count})`;
            button.addEventListener('click', () => {
                activeModality = activeModality === value ? null : value;
                renderPapers();
            });
            filterBar.appendChild(button);
        };

        makeButton('All', null);
        modalities.forEach(m => makeButton(m, m, counts[m]));
    }

    function renderPapers() {
        const matches = allPapers.filter(paper =>
            (activeModality === null || paper.modalities.includes(activeModality)) &&
            (!searchQuery || paper.searchText.includes(searchQuery))
        );

        Object.entries(STATUS_LISTS).forEach(([status, listId]) => {
            renderPaperList(listId, matches.filter(paper => paper.status === status));
        });

        // Highlight the active modality button
        document.querySelectorAll('.modality-filter').forEach(button => {
            const isActive = button.dataset.modality === (activeModality || '');
            button.classList.toggle('btn-danger', isActive);
            button.classList.toggle('btn-outline-secondary', !isActive);
            button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });

        const count = document.getElementById('paper-count');
        if (count) {
            const filtered = activeModality !== null || searchQuery;
            count.textContent = filtered
                ? `Showing ${matches.length} of ${allPapers.length} papers`
                : `${allPapers.length} papers`;
        }

        const noMatch = document.getElementById('no-papers-match');
        if (noMatch) {
            noMatch.style.display = matches.length === 0 ? '' : 'none';
        }
    }

    function renderPaperList(listId, papers) {
        const list = document.getElementById(listId);
        if (!list) {
            return;
        }

        // Hide the sub-heading and list when this category has nothing to show
        const heading = list.previousElementSibling;
        const visible = papers.length > 0;
        list.style.display = visible ? '' : 'none';
        if (heading && heading.tagName === 'H5') {
            heading.style.display = visible ? '' : 'none';
        }

        list.replaceChildren();
        papers.forEach(paper => {
            const li = document.createElement('li');
            li.className = 'mb-3';

            const title = document.createElement('strong');
            title.textContent = paper.title;
            li.appendChild(title);

            if (paper.authors) {
                li.appendChild(document.createElement('br'));
                const authors = document.createElement('em');
                authors.textContent = paper.authors;
                li.appendChild(authors);
            }

            if (paper.openReviewLink) {
                li.appendChild(document.createTextNode(' - '));
                const link = document.createElement('a');
                link.href = paper.openReviewLink;
                link.target = '_blank';
                link.textContent = 'See on OpenReview';
                li.appendChild(link);
            }

            if (paper.modalities.length > 0) {
                const tags = document.createElement('div');
                tags.className = 'mt-1';
                paper.modalities.forEach(m => {
                    const tag = document.createElement('span');
                    tag.className = 'badge rounded-pill bg-light text-secondary border me-1';
                    tag.textContent = m;
                    tags.appendChild(tag);
                });
                li.appendChild(tags);
            }

            list.appendChild(li);
        });
    }

    // Helper function to parse CSV line (handles quoted fields with commas)
    function parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];

            if (char === '"' && inQuotes && line[i + 1] === '"') {
                // Escaped quote ("") inside a quoted field
                current += '"';
                i++;
            } else if (char === '"') {
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
