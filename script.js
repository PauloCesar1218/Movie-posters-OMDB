const SEARCH_API_KEY = 'a8e56064';
const DETAILS_API_KEY = 'a8e56064';
const SEARCH_API_URL = 'http://www.omdbapi.com/';
const DEBOUNCE_DELAY = 500;

const searchInput = document.getElementById('searchInput');
const resultsContainer = document.getElementById('resultsContainer');
const loadingIndicator = document.getElementById('loadingIndicator');
const bottomSheet = document.getElementById('bottomSheet');
const bottomSheetTitle = document.getElementById('bottomSheetTitle');
const bottomSheetContent = document.getElementById('bottomSheetContent');
const closeBottomSheet = document.getElementById('closeBottomSheet');
const overlay = document.getElementById('overlay');

let searchTimeout;
let currentDetailsElement = null;
let detailsCache = {};
let isMobile = window.innerWidth <= 768;

function debounce(func, delay) {
    return function(...args) {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => func.apply(this, args), delay);
    };
}

function isMobileDevice() {
    return window.innerWidth <= 768;
}

async function searchMovies(query) {
    if (!query || query.trim().length < 2) {
        resultsContainer.innerHTML = '';
        return;
    }
    
    showLoading();
    
    try {
        const url = `${SEARCH_API_URL}?apikey=${SEARCH_API_KEY}&s=${encodeURIComponent(query)}`;
        const response = await fetch(url);
        const data = await response.json();
        
        hideLoading();
        
        if (data.Response === 'True' && data.Search) {
            displayResults(data.Search);
        } else {
            displayNoResults();
        }
    } catch (error) {
        hideLoading();
        console.error('Search error:', error);
        resultsContainer.innerHTML = '<div class="no-results">Error searching movies. Please try again.</div>';
    }
}

function createSkeletonCard() {
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

function displayResults(movies) {
    resultsContainer.innerHTML = '';
    
    movies.forEach(movie => {
        const card = createMovieCard(movie);
        resultsContainer.appendChild(card);
    });
}

function createMovieCard(movie) {
    const wrapper = document.createElement('div');
    wrapper.className = 'movie-card-wrapper';
    
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.dataset.imdbId = movie.imdbID;
    
    const poster = document.createElement('img');
    poster.className = 'poster';
    poster.src = movie.Poster !== 'N/A' ? movie.Poster : '';
    poster.alt = movie.Title;
    poster.onerror = function() {
        this.style.display = 'none';
        const placeholder = document.createElement('div');
        placeholder.className = 'poster';
        placeholder.textContent = 'No Image';
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
    
    wrapper.appendChild(card);
    wrapper.appendChild(detailsContainer);
    
    return wrapper;
}

function createSkeletonDetails() {
    return `
        <div class="detail-row skeleton-row">
            <strong class="skeleton skeleton-label"></strong>
            <span class="skeleton skeleton-value"></span>
        </div>
        <div class="detail-row skeleton-row">
            <strong class="skeleton skeleton-label"></strong>
            <span class="skeleton skeleton-value"></span>
        </div>
        <div class="detail-row skeleton-row">
            <strong class="skeleton skeleton-label"></strong>
            <span class="skeleton skeleton-value"></span>
        </div>
        <div class="detail-row skeleton-row">
            <strong class="skeleton skeleton-label"></strong>
            <span class="skeleton skeleton-value skeleton-value-long"></span>
        </div>
        <div class="detail-row skeleton-row">
            <strong class="skeleton skeleton-label"></strong>
            <span class="skeleton skeleton-value skeleton-value-long"></span>
        </div>
        <div class="detail-row skeleton-row">
            <strong class="skeleton skeleton-label"></strong>
            <span class="skeleton skeleton-value"></span>
        </div>
        <div class="plot" style="margin-top: 15px;">
            <div class="skeleton skeleton-line"></div>
            <div class="skeleton skeleton-line"></div>
            <div class="skeleton skeleton-line skeleton-line-short"></div>
        </div>
    `;
}

function showMovieDetailsOnHover(imdbId, cardElement) {
    const wrapper = cardElement.closest('.movie-card-wrapper');
    if (!wrapper) return;
    
    const detailsElement = wrapper.querySelector('.movie-details');
    if (!detailsElement) return;
    
    if (currentDetailsElement && currentDetailsElement !== detailsElement) {
        currentDetailsElement.classList.remove('visible');
    }
    
    currentDetailsElement = detailsElement;
    
    detailsElement.innerHTML = createSkeletonDetails();
    detailsElement.classList.add('visible');
    
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
            detailsElement.innerHTML = formatDetailsForHover(details);
        }
    });
}

function hideMovieDetailsOnHover() {
    if (currentDetailsElement) {
        currentDetailsElement.classList.remove('visible');
        currentDetailsElement = null;
    }
}

function showMovieDetails(imdbId, cardElement) {
    if (!bottomSheet || !bottomSheetTitle || !bottomSheetContent) {
        console.error('Bottom sheet elements not found');
        return;
    }
    
    const cardPoster = cardElement.querySelector('.poster');
    const cardTitle = cardElement.querySelector('.title');
    const posterSrc = cardPoster && cardPoster.src ? cardPoster.src : '';
    const titleText = cardTitle ? cardTitle.textContent : 'Loading...';
    
    bottomSheetTitle.textContent = titleText;
    
    let initialContent = '';
    if (posterSrc && !posterSrc.includes('data:') && posterSrc !== window.location.href) {
        initialContent = `<img src="${posterSrc}" alt="${titleText}" class="poster-large" style="max-width: 300px; width: 100%; aspect-ratio: 2/3; object-fit: cover; background: #f0f0f0;">`;
    } else {
        initialContent = `<div class="poster-large" style="background: #f0f0f0; display: flex; align-items: center; justify-content: center; color: #999; max-width: 300px; width: 100%; aspect-ratio: 2/3; margin: 0 auto 20px;">No Image</div>`;
    }
    
    bottomSheetContent.innerHTML = initialContent;
    bottomSheet.classList.add('open');
    overlay.classList.add('visible');
    document.body.style.overflow = 'hidden';
    
    fetchMovieDetails(imdbId, (details) => {
        if (bottomSheetTitle && bottomSheetContent) {
            bottomSheetTitle.textContent = details.Title || titleText;
            bottomSheetContent.innerHTML = formatDetailsForBottomSheet(details);
        }
    });
}

function fetchMovieDetails(imdbId, callback) {
    if (detailsCache[imdbId]) {
        callback(detailsCache[imdbId]);
        return;
    }
    
    const url = `${SEARCH_API_URL}?apikey=${DETAILS_API_KEY}&i=${imdbId}`;
    
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

function formatDetailsForHover(details) {
    if (details.Error) {
        return `<div>${details.Error}</div>`;
    }
    
    let html = '';
    
    if (details.Year) {
        html += `<div class="detail-row"><strong>Year:</strong> ${details.Year}</div>`;
    }
    if (details.Rated) {
        html += `<div class="detail-row"><strong>Rated:</strong> ${details.Rated}</div>`;
    }
    if (details.Runtime) {
        html += `<div class="detail-row"><strong>Runtime:</strong> ${details.Runtime}</div>`;
    }
    if (details.Genre) {
        html += `<div class="detail-row"><strong>Genre:</strong> ${details.Genre}</div>`;
    }
    if (details.Director) {
        html += `<div class="detail-row"><strong>Director:</strong> ${details.Director}</div>`;
    }
    if (details.Actors) {
        html += `<div class="detail-row"><strong>Actors:</strong> ${details.Actors}</div>`;
    }
    if (details.imdbRating) {
        html += `<div class="detail-row"><strong>IMDB Rating:</strong> ${details.imdbRating}</div>`;
    }
    if (details.Plot && details.Plot !== 'N/A') {
        html += `<div class="plot">${details.Plot}</div>`;
    }
    
    return html || '<div>No details available</div>';
}

function formatDetailsForBottomSheet(details) {
    if (details.Error) {
        return `<div class="detail-section"><div class="detail-value">${details.Error}</div></div>`;
    }
    
    let html = '';
    
    if (details.Poster && details.Poster !== 'N/A') {
        html += `<img src="${details.Poster}" alt="${details.Title}" class="poster-large">`;
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
            html += `
                <div class="detail-section">
                    <span class="detail-label">${field.label}:</span>
                    <div class="detail-value">${field.value}</div>
                </div>
            `;
        }
    });
    
    if (details.Plot && details.Plot !== 'N/A') {
        html += `
            <div class="detail-section">
                <span class="detail-label">Plot:</span>
                <div class="detail-value">${details.Plot}</div>
            </div>
        `;
    }
    
    return html || '<div class="detail-section"><div class="detail-value">No details available</div></div>';
}

function closeBottomSheetHandler() {
    bottomSheet.classList.remove('open');
    overlay.classList.remove('visible');
    document.body.style.overflow = '';
}

function showLoading() {
    resultsContainer.innerHTML = '';
    for (let i = 0; i < 8; i++) {
        const skeletonCard = createSkeletonCard();
        resultsContainer.appendChild(skeletonCard);
    }
}

function hideLoading() {
    const skeletonCards = resultsContainer.querySelectorAll('.skeleton-card');
    skeletonCards.forEach(card => card.remove());
}

function displayNoResults() {
    resultsContainer.innerHTML = '<div class="no-results">No results found. Try a different search term.</div>';
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
});

