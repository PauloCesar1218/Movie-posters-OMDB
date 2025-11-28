# Movie Search Application

A vanilla JavaScript movie search app using the OMDB API. Built with HTML, CSS, and JavaScript—no frameworks or build tools required.

## Problems

- **API Key Note**: The originally provided API key was not working, so I went to the OMDB website, generated and activated a new one from the OMDB website

- **Tooltip Positioning Issue**: Initially, tooltips were positioned absolutely using calculated pixel positions relative to the viewport, causing inconsistent behavior when cards were scrolled out of view. Solution: Each movie card now has its own details container attached via a wrapper structure (`movie-card-wrapper`). Tooltips are positioned relative to their card using CSS classes (`left-side`/`right-side` so that the movie cards on the corners don't have the detail container outside of the viewpot) instead of dynamic calculations, ensuring consistent positioning regardless of scroll position.

## Getting Started

Open `index.html` in your browser. No installation needed.

## Features

- **Instant Search**: Real-time search with debounced API calls (more on that below)
- **Responsive Design**: Desktop hover tooltips and mobile bottom sheet container
- **Performance Optimized**: Event delegation, caching, and skeleton loading

## Project Structure

- `index.html` - Main page structure
- `styles.css` - Responsive styling
- `script.js` - Application logic

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


## Potential Improvements

- **Lazy Loading**: Implement lazy loading for movie poster images to improve initial page load performance
- **Infinite Scroll**: Implement pagination or infinite scroll for search results to handle large result sets
- **Virtualization**: Use virtual scrolling for better performance with hundreds of results
- **Favorites/Bookmarking**: Add ability to save favorite movies with localStorage
- **Keyboard Navigation**: Support arrow keys and Enter for navigating and selecting movies
- **Error Handling**: Add retry mechanisms and better error messages for failed API calls
- **Accessibility**: Improve ARIA labels, keyboard navigation, and screen reader support
- **Testing**: Add unit tests for core functions and integration tests for user flows
