export const PROXY_API_URL = 'http://localhost:3000/api';
export const DEBOUNCE_DELAY = 500;

const searchInput = document.getElementById('searchInput');
const resultsContainer = document.getElementById('resultsContainer');
const loadingIndicator = document.getElementById('loadingIndicator');
const bottomSheet = document.getElementById('bottomSheet');
const bottomSheetTitle = document.getElementById('bottomSheetTitle');
const bottomSheetContent = document.getElementById('bottomSheetContent');
const closeBottomSheet = document.getElementById('closeBottomSheet');
const overlay = document.getElementById('overlay');
const screenReaderAnnouncements = document.getElementById('screenReaderAnnouncements');

export let currentDetailsElement = null;
export let detailsCache = {};
let isMobile = window.innerWidth <= 768;

export function debounce(func, delay) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), delay);
    };
}

export function isMobileDevice() {
    return window.innerWidth <= 768;
}

export function createElement(tag, className, textContent) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (textContent !== undefined) element.textContent = textContent;
    return element;
}

export function clearContainer(container) {
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
}

export function announceToScreenReader(message) {
    if (!screenReaderAnnouncements) return;
    
    screenReaderAnnouncements.textContent = '';
    
    setTimeout(() => {
        screenReaderAnnouncements.textContent = message;
    }, 100);
    
    setTimeout(() => {
        screenReaderAnnouncements.textContent = '';
    }, 2000);
}

export async function searchMovies(query) {
    if (!query || query.trim().length < 3) {
        clearContainer(resultsContainer);
        return;
    }
    
    showLoading();
    
    try {
        const url = `${PROXY_API_URL}/search?s=${encodeURIComponent(query)}`;
        const response = await fetch(url);
        const data = await response.json();
        
        hideLoading();
        
        if (data.Response === 'True' && data.Search) {
            const count = data.Search.length;
            displayResults(data.Search);
            announceToScreenReader(`Found ${count} ${count === 1 ? 'result' : 'results'}`);
        } else {
            displayNoResults();
            announceToScreenReader('No results found');
        }
    } catch (error) {
        hideLoading();
        console.error('Search error:', error);
        clearContainer(resultsContainer);
        const errorDiv = createElement('div', 'no-results', 'Error searching movies. Please try again.');
        resultsContainer.appendChild(errorDiv);
    }
}

export function createSkeletonCard() {
    const wrapper = document.createElement('div');
    wrapper.className = 'movie-card-wrapper';
    
    const card = document.createElement('div');
    card.className = 'movie-card skeleton-card';
    
    const poster = document.createElement('div');
    poster.className = 'poster skeleton skeleton-poster';
    
    const movieInfo = document.createElement('div');
    movieInfo.className = 'movie-info';
    
    const title = document.createElement('div');
    title.className = 'title skeleton skeleton-title';
    
    const type = document.createElement('div');
    type.className = 'type skeleton skeleton-type';
    
    movieInfo.appendChild(title);
    movieInfo.appendChild(type);
    
    card.appendChild(poster);
    card.appendChild(movieInfo);
    wrapper.appendChild(card);
    
    return wrapper;
}

export function displayResults(movies) {
    clearContainer(resultsContainer);
    
    movies.forEach(movie => {
        const card = createMovieCard(movie);
        resultsContainer.appendChild(card);
    });
}

export function createMovieCard(movie) {
    const wrapper = document.createElement('div');
    wrapper.className = 'movie-card-wrapper';
    
    const card = document.createElement('button');
    card.className = 'movie-card';
    card.dataset.imdbId = movie.imdbID;
    card.type = 'button';
    card.setAttribute('aria-label', `View details for ${movie.Title}, ${movie.Type}`);
    card.setAttribute('tabindex', '0');
    
    const poster = document.createElement('img');
    poster.className = 'poster';
    poster.src = movie.Poster !== 'N/A' ? movie.Poster : '';
    poster.alt = movie.Poster !== 'N/A' ? `Poster for ${movie.Title}` : '';
    poster.setAttribute('aria-hidden', movie.Poster === 'N/A' ? 'true' : 'false');
    poster.onerror = function() {
        this.style.display = 'none';
        const placeholder = document.createElement('div');
        placeholder.className = 'poster';
        placeholder.textContent = 'No Image';
        placeholder.setAttribute('aria-hidden', 'true');
        this.parentNode.replaceChild(placeholder, this);
    };
    
    const movieInfo = document.createElement('div');
    movieInfo.className = 'movie-info';
    
    const title = document.createElement('div');
    title.className = 'title';
    title.textContent = movie.Title;
    
    const type = document.createElement('div');
    type.className = 'type';
    type.textContent = movie.Type;
    
    movieInfo.appendChild(title);
    movieInfo.appendChild(type);
    
    card.appendChild(poster);
    card.appendChild(movieInfo);
    
    const detailsContainer = document.createElement('div');
    detailsContainer.className = 'movie-details';
    detailsContainer.dataset.imdbId = movie.imdbID;
    detailsContainer.setAttribute('role', 'tooltip');
    detailsContainer.setAttribute('aria-live', 'polite');
    detailsContainer.setAttribute('aria-atomic', 'true');
    detailsContainer.setAttribute('aria-hidden', 'true');
    
    wrapper.appendChild(card);
    wrapper.appendChild(detailsContainer);
    
    return wrapper;
}

export function createSkeletonDetails() {
    const fragment = document.createDocumentFragment();
    
    for (let i = 0; i < 6; i++) {
        const row = createElement('div', 'detail-row skeleton-row');
        const label = createElement('strong', 'skeleton skeleton-label');
        const value = createElement('span', i >= 3 ? 'skeleton skeleton-value skeleton-value-long' : 'skeleton skeleton-value');
        row.appendChild(label);
        row.appendChild(value);
        fragment.appendChild(row);
    }
    
    const plot = createElement('div', 'plot');
    plot.style.marginTop = '15px';
    const line1 = createElement('div', 'skeleton skeleton-line');
    const line2 = createElement('div', 'skeleton skeleton-line');
    const line3 = createElement('div', 'skeleton skeleton-line skeleton-line-short');
    plot.appendChild(line1);
    plot.appendChild(line2);
    plot.appendChild(line3);
    fragment.appendChild(plot);
    
    return fragment;
}

export function showMovieDetailsOnHover(imdbId, cardElement) {
    const wrapper = cardElement.closest('.movie-card-wrapper');
    if (!wrapper) return;
    
    const detailsElement = wrapper.querySelector('.movie-details');
    if (!detailsElement) return;
    
    const cardTitle = cardElement.querySelector('.title');
    const cardType = cardElement.querySelector('.type');
    const movieTitle = cardTitle ? cardTitle.textContent : 'Movie';
    const movieType = cardType ? cardType.textContent : '';
    
    if (currentDetailsElement && currentDetailsElement !== detailsElement) {
        currentDetailsElement.classList.remove('visible');
    }
    
    currentDetailsElement = detailsElement;
    
    clearContainer(detailsElement);
    const skeletonFragment = createSkeletonDetails();
    detailsElement.appendChild(skeletonFragment);
    detailsElement.classList.add('visible');
    detailsElement.setAttribute('aria-hidden', 'false');
    
    announceToScreenReader(`Loading details for ${movieTitle}${movieType ? `, ${movieType}` : ''}`);
    
    const card = wrapper.querySelector('.movie-card');
    const rect = card.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const spacing = 20;
    
    if (rect.right + 400 + spacing <= viewportWidth) {
        detailsElement.classList.remove('left-side');
        detailsElement.classList.add('right-side');
    } else if (rect.left - 400 - spacing >= 0) {
        detailsElement.classList.remove('right-side');
        detailsElement.classList.add('left-side');
    } else {
        if (rect.right < viewportWidth / 2) {
            detailsElement.classList.remove('left-side');
            detailsElement.classList.add('right-side');
        } else {
            detailsElement.classList.remove('right-side');
            detailsElement.classList.add('left-side');
        }
    }
    
    detailsElement.addEventListener('mouseenter', () => {
        clearTimeout(hoverTimeout);
    });
    
    detailsElement.addEventListener('mouseleave', () => {
        if (!tooltipPinned && currentHoverCard) {
            hoverTimeout = setTimeout(() => {
                hideMovieDetailsOnHover();
                currentHoverCard = null;
            }, 100);
        }
    });
    
    fetchMovieDetails(imdbId, (details) => {
        if (detailsElement.parentNode && detailsElement === currentDetailsElement) {
            clearContainer(detailsElement);
            const fragment = formatDetailsForHover(details);
            detailsElement.appendChild(fragment);
            detailsElement.setAttribute('aria-hidden', 'false');
            
            if (details.Year || details.Rated || details.Runtime) {
                const detailsSummary = [];
                if (details.Year) detailsSummary.push(`Year: ${details.Year}`);
                if (details.Rated) detailsSummary.push(`Rated: ${details.Rated}`);
                if (details.Runtime) detailsSummary.push(`Runtime: ${details.Runtime}`);
                if (detailsSummary.length > 0) {
                    announceToScreenReader(`${movieTitle}. ${detailsSummary.join(', ')}`);
                }
            }
        }
    });
}

export function hideMovieDetailsOnHover() {
    if (currentDetailsElement) {
        currentDetailsElement.classList.remove('visible');
        currentDetailsElement.setAttribute('aria-hidden', 'true');
        currentDetailsElement = null;
    }
}

export let previousActiveElement = null;

export function showMovieDetails(imdbId, cardElement) {
    if (!bottomSheet || !bottomSheetTitle || !bottomSheetContent) {
        console.error('Bottom sheet elements not found');
        return;
    }
    
    previousActiveElement = document.activeElement;
    
    const cardPoster = cardElement.querySelector('.poster');
    const cardTitle = cardElement.querySelector('.title');
    const posterSrc = cardPoster && cardPoster.src ? cardPoster.src : '';
    const titleText = cardTitle ? cardTitle.textContent : 'Loading...';
    
    bottomSheetTitle.textContent = titleText;
    bottomSheet.setAttribute('aria-hidden', 'false');
    overlay.setAttribute('aria-hidden', 'false');
    
    clearContainer(bottomSheetContent);
    
    if (posterSrc && !posterSrc.includes('data:') && posterSrc !== window.location.href) {
        const img = document.createElement('img');
        img.src = posterSrc;
        img.alt = `Poster for ${titleText}`;
        img.className = 'poster-large';
        img.style.maxWidth = '300px';
        img.style.width = '100%';
        img.style.aspectRatio = '2/3';
        img.style.objectFit = 'cover';
        img.style.background = '#f0f0f0';
        bottomSheetContent.appendChild(img);
    } else {
        const placeholder = createElement('div', 'poster-large', 'No Image');
        placeholder.setAttribute('aria-label', 'No poster available');
        placeholder.style.background = '#f0f0f0';
        placeholder.style.display = 'flex';
        placeholder.style.alignItems = 'center';
        placeholder.style.justifyContent = 'center';
        placeholder.style.color = '#999';
        placeholder.style.maxWidth = '300px';
        placeholder.style.width = '100%';
        placeholder.style.aspectRatio = '2/3';
        placeholder.style.margin = '0 auto 20px';
        bottomSheetContent.appendChild(placeholder);
    }
    bottomSheet.classList.add('open');
    overlay.classList.add('visible');
    document.body.style.overflow = 'hidden';
    
    setTimeout(() => {
        closeBottomSheet.focus();
    }, 100);
    
    fetchMovieDetails(imdbId, (details) => {
        if (bottomSheetTitle && bottomSheetContent) {
            bottomSheetTitle.textContent = details.Title || titleText;
            clearContainer(bottomSheetContent);
            const fragment = formatDetailsForBottomSheet(details);
            bottomSheetContent.appendChild(fragment);
        }
    });
}

export function fetchMovieDetails(imdbId, callback) {
    if (detailsCache[imdbId]) {
        callback(detailsCache[imdbId]);
        return;
    }
    
    const url = `${PROXY_API_URL}/details?i=${encodeURIComponent(imdbId)}`;
    
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.Response === 'True') {
                detailsCache[imdbId] = data;
                callback(data);
            }
        })
        .catch(error => {
            console.error('Details fetch error:', error);
            if (callback) {
                callback({ Error: 'Failed to load details' });
            }
        });
}

export function formatDetailsForHover(details) {
    const fragment = document.createDocumentFragment();
    
    if (details.Error) {
        const errorDiv = createElement('div', '', details.Error);
        fragment.appendChild(errorDiv);
        return fragment;
    }
    
    const fields = [
        { label: 'Year', value: details.Year },
        { label: 'Rated', value: details.Rated },
        { label: 'Runtime', value: details.Runtime },
        { label: 'Genre', value: details.Genre },
        { label: 'Director', value: details.Director },
        { label: 'Actors', value: details.Actors },
        { label: 'IMDB Rating', value: details.imdbRating }
    ];
    
    fields.forEach(field => {
        if (field.value) {
            const row = createElement('div', 'detail-row');
            const label = createElement('strong', '', `${field.label}:`);
            const value = document.createTextNode(` ${field.value}`);
            row.appendChild(label);
            row.appendChild(value);
            fragment.appendChild(row);
        }
    });
    
    if (details.Plot && details.Plot !== 'N/A') {
        const plot = createElement('div', 'plot', details.Plot);
        fragment.appendChild(plot);
    }
    
    if (fragment.children.length === 0) {
        const noDetails = createElement('div', '', 'No details available');
        fragment.appendChild(noDetails);
    }
    
    return fragment;
}

export function formatDetailsForBottomSheet(details) {
    const fragment = document.createDocumentFragment();
    
    if (details.Error) {
        const section = createElement('div', 'detail-section');
        const value = createElement('div', 'detail-value', details.Error);
        section.appendChild(value);
        fragment.appendChild(section);
        return fragment;
    }
    
    if (details.Poster && details.Poster !== 'N/A') {
        const img = document.createElement('img');
        img.src = details.Poster;
        img.alt = `Poster for ${details.Title || 'movie'}`;
        img.className = 'poster-large';
        fragment.appendChild(img);
    }
    
    const detailFields = [
        { label: 'Year', value: details.Year },
        { label: 'Rated', value: details.Rated },
        { label: 'Released', value: details.Released },
        { label: 'Runtime', value: details.Runtime },
        { label: 'Genre', value: details.Genre },
        { label: 'Director', value: details.Director },
        { label: 'Writer', value: details.Writer },
        { label: 'Actors', value: details.Actors },
        { label: 'Language', value: details.Language },
        { label: 'Country', value: details.Country },
        { label: 'Awards', value: details.Awards },
        { label: 'IMDB Rating', value: details.imdbRating },
        { label: 'IMDB Votes', value: details.imdbVotes },
        { label: 'Box Office', value: details.BoxOffice }
    ];
    
    detailFields.forEach(field => {
        if (field.value && field.value !== 'N/A') {
            const section = createElement('div', 'detail-section');
            const label = createElement('span', 'detail-label', `${field.label}:`);
            const value = createElement('div', 'detail-value', field.value);
            section.appendChild(label);
            section.appendChild(value);
            fragment.appendChild(section);
        }
    });
    
    if (details.Plot && details.Plot !== 'N/A') {
        const section = createElement('div', 'detail-section');
        const label = createElement('span', 'detail-label', 'Plot:');
        const value = createElement('div', 'detail-value', details.Plot);
        section.appendChild(label);
        section.appendChild(value);
        fragment.appendChild(section);
    }
    
    if (fragment.children.length === 0) {
        const section = createElement('div', 'detail-section');
        const value = createElement('div', 'detail-value', 'No details available');
        section.appendChild(value);
        fragment.appendChild(section);
    }
    
    return fragment;
}

export function closeBottomSheetHandler() {
    bottomSheet.classList.remove('open');
    overlay.classList.remove('visible');
    bottomSheet.setAttribute('aria-hidden', 'true');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    
    if (previousActiveElement) {
        previousActiveElement.focus();
        previousActiveElement = null;
    }
}

export function showLoading() {
    clearContainer(resultsContainer);
    loadingIndicator.classList.remove('hidden');
    loadingIndicator.textContent = 'Loading movies...';
    for (let i = 0; i < 8; i++) {
        const skeletonCard = createSkeletonCard();
        resultsContainer.appendChild(skeletonCard);
    }
}

export function hideLoading() {
    loadingIndicator.classList.add('hidden');
    const skeletonCards = resultsContainer.querySelectorAll('.skeleton-card');
    skeletonCards.forEach(card => card.remove());
}

export function displayNoResults() {
    clearContainer(resultsContainer);
    const noResults = createElement('div', 'no-results', 'No results found. Try a different search term.');
    resultsContainer.appendChild(noResults);
}

const debouncedSearch = debounce(searchMovies, DEBOUNCE_DELAY);

searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    debouncedSearch(query);
});

let touchStartCard = null;

resultsContainer.addEventListener('touchstart', (e) => {
    if (isMobileDevice()) {
        const card = e.target.closest('.movie-card');
        touchStartCard = card;
    }
});

resultsContainer.addEventListener('touchend', (e) => {
    if (isMobileDevice()) {
        const card = e.target.closest('.movie-card');
        if (card && card === touchStartCard) {
            e.preventDefault();
            e.stopPropagation();
            const imdbId = card.dataset.imdbId;
            if (imdbId) {
                showMovieDetails(imdbId, card);
            }
        }
        touchStartCard = null;
    }
});

resultsContainer.addEventListener('click', (e) => {
    const card = e.target.closest('.movie-card');
    if (!card) return;
    
    if (isMobileDevice()) {
        e.preventDefault();
        e.stopPropagation();
        const imdbId = card.dataset.imdbId;
        if (imdbId) {
            showMovieDetails(imdbId, card);
        }
    } else {
        e.preventDefault();
        e.stopPropagation();
        const imdbId = card.dataset.imdbId;
        if (imdbId) {
            if (currentHoverCard === card && currentDetailsElement && currentDetailsElement.classList.contains('visible')) {
                hideMovieDetailsOnHover();
                currentHoverCard = null;
                tooltipPinned = false;
            } else {
                clearTimeout(hoverTimeout);
                tooltipPinned = true;
                currentHoverCard = card;
                showMovieDetailsOnHover(imdbId, card);
            }
        }
    }
});

resultsContainer.addEventListener('keydown', (e) => {
    const card = e.target.closest('.movie-card');
    if (!card) return;
    
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const imdbId = card.dataset.imdbId;
        if (imdbId) {
            if (isMobileDevice()) {
                showMovieDetails(imdbId, card);
            } else {
                if (currentHoverCard === card && currentDetailsElement && currentDetailsElement.classList.contains('visible')) {
                    hideMovieDetailsOnHover();
                    currentHoverCard = null;
                    tooltipPinned = false;
                } else {
                    clearTimeout(hoverTimeout);
                    tooltipPinned = true;
                    currentHoverCard = card;
                    showMovieDetailsOnHover(imdbId, card);
                }
            }
        }
    }
});

let hoverTimeout = null;
let currentHoverCard = null;
let tooltipPinned = false;

resultsContainer.addEventListener('mouseover', (e) => {
    if (isMobileDevice()) return;
    
    const card = e.target.closest('.movie-card');
    const wrapper = e.target.closest('.movie-card-wrapper');
    if (card && wrapper) {
        clearTimeout(hoverTimeout);
        const imdbId = card.dataset.imdbId;
        
        if (currentHoverCard !== card) {
            tooltipPinned = false;
            currentHoverCard = card;
            showMovieDetailsOnHover(imdbId, card);
        }
    }
});

resultsContainer.addEventListener('mouseout', (e) => {
    if (isMobileDevice()) return;
    
    const card = e.target.closest('.movie-card');
    const wrapper = e.target.closest('.movie-card-wrapper');
    const relatedCard = e.relatedTarget ? e.relatedTarget.closest('.movie-card') : null;
    const relatedWrapper = e.relatedTarget ? e.relatedTarget.closest('.movie-card-wrapper') : null;
    const relatedDetails = e.relatedTarget ? e.relatedTarget.closest('.movie-details') : null;
    
    if (card && card === currentHoverCard && wrapper !== relatedWrapper && relatedDetails !== currentDetailsElement) {
        if (!tooltipPinned) {
            hoverTimeout = setTimeout(() => {
                hideMovieDetailsOnHover();
                currentHoverCard = null;
            }, 100);
        }
    }
});


closeBottomSheet.addEventListener('click', closeBottomSheetHandler);
overlay.addEventListener('click', closeBottomSheetHandler);

window.addEventListener('resize', () => {
    isMobile = isMobileDevice();
});

window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && bottomSheet.classList.contains('open')) {
        closeBottomSheetHandler();
    }
    
    if (e.key === 'Tab' && bottomSheet.classList.contains('open')) {
        const focusableElements = bottomSheet.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
        }
    }
});

