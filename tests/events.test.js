import { describe, it, expect, beforeEach, beforeAll, vi, afterEach } from 'vitest';
import { setupDOM, clearDetailsCache } from './helpers.js';
import { 
  searchMovies, 
  showMovieDetails, 
  showMovieDetailsOnHover,
  hideMovieDetailsOnHover,
  createMovieCard,
  displayResults,
  isMobileDevice
} from '../script.js';
import userEvent from '@testing-library/user-event';

let searchInput, resultsContainer, bottomSheet, bottomSheetContent, closeBottomSheet, overlay;

beforeAll(async () => {
  setupDOM();
  searchInput = document.getElementById('searchInput');
  resultsContainer = document.getElementById('resultsContainer');
  bottomSheet = document.getElementById('bottomSheet');
  bottomSheetContent = document.getElementById('bottomSheetContent');
  closeBottomSheet = document.getElementById('closeBottomSheet');
  overlay = document.getElementById('overlay');
  
  await import('../script.js');
});

beforeEach(() => {
  vi.clearAllMocks();
  global.fetch = vi.fn();
  window.fetch = global.fetch;
  clearDetailsCache();
  searchInput.value = '';
  resultsContainer.innerHTML = '';
  bottomSheet.classList.remove('open');
  overlay.classList.remove('visible');
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Event Listeners', () => {
  describe('searchInput input event', () => {
    it('should trigger search on input', async () => {
      const mockMovies = {
        Response: 'True',
        Search: [
          { imdbID: 'tt1', Title: 'Movie 1', Type: 'movie', Poster: 'N/A' }
        ]
      };

      global.fetch.mockResolvedValueOnce({
        json: async () => mockMovies
      });

      const user = userEvent.setup({ delay: null });
      await user.type(searchInput, 'test');

      await new Promise(resolve => setTimeout(resolve, 600));

      expect(global.fetch).toHaveBeenCalled();
      const cards = resultsContainer.querySelectorAll('.movie-card-wrapper');
      expect(cards.length).toBeGreaterThan(0);
    });

    it('should debounce search input', async () => {
      global.fetch.mockResolvedValue({
        json: async () => ({ Response: 'True', Search: [] })
      });

      const user = userEvent.setup({ delay: null });
      await user.type(searchInput, 'abc');

      await new Promise(resolve => setTimeout(resolve, 600));

      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('resultsContainer click event', () => {
    it('should show movie details on mobile click', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500
      });

      const movie = { imdbID: 'tt123', Title: 'Test', Type: 'movie', Poster: 'N/A' };
      const cardWrapper = createMovieCard(movie);
      resultsContainer.appendChild(cardWrapper);
      const card = cardWrapper.querySelector('.movie-card');

      global.fetch.mockResolvedValueOnce({
        json: async () => ({ Response: 'True', Title: 'Test' })
      });

      card.click();

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(bottomSheet.classList.contains('open')).toBe(true);
    });

    it('should toggle hover details on desktop click', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024
      });

      const movie = { imdbID: 'tt123', Title: 'Test', Type: 'movie', Poster: 'N/A' };
      const cardWrapper = createMovieCard(movie);
      resultsContainer.appendChild(cardWrapper);
      const card = cardWrapper.querySelector('.movie-card');

      global.fetch.mockResolvedValue({
        json: async () => ({ Response: 'True', Title: 'Test' })
      });

      card.click();

      await new Promise(resolve => setTimeout(resolve, 100));

      const detailsElement = cardWrapper.querySelector('.movie-details');
      expect(detailsElement.classList.contains('visible')).toBe(true);

      card.click();

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(detailsElement.classList.contains('visible')).toBe(false);
    });
  });

  describe('resultsContainer keydown event', () => {
    it('should show details on Enter key', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500
      });

      const movie = { imdbID: 'tt123', Title: 'Test', Type: 'movie', Poster: 'N/A' };
      const cardWrapper = createMovieCard(movie);
      resultsContainer.appendChild(cardWrapper);
      const card = cardWrapper.querySelector('.movie-card');
      card.focus();

      global.fetch.mockResolvedValueOnce({
        json: async () => ({ Response: 'True', Title: 'Test' })
      });

      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
      card.dispatchEvent(enterEvent);

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(bottomSheet.classList.contains('open')).toBe(true);
    });

    it('should show details on Space key', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500
      });

      const movie = { imdbID: 'tt123', Title: 'Test', Type: 'movie', Poster: 'N/A' };
      const cardWrapper = createMovieCard(movie);
      resultsContainer.appendChild(cardWrapper);
      const card = cardWrapper.querySelector('.movie-card');
      card.focus();

      global.fetch.mockResolvedValueOnce({
        json: async () => ({ Response: 'True', Title: 'Test' })
      });

      const spaceEvent = new KeyboardEvent('keydown', { key: ' ', bubbles: true });
      card.dispatchEvent(spaceEvent);

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(bottomSheet.classList.contains('open')).toBe(true);
    });
  });

  describe('resultsContainer touch events', () => {
    it('should handle touchstart and touchend', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500
      });

      const movie = { imdbID: 'tt123', Title: 'Test', Type: 'movie', Poster: 'N/A' };
      const cardWrapper = createMovieCard(movie);
      resultsContainer.appendChild(cardWrapper);
      const card = cardWrapper.querySelector('.movie-card');

      global.fetch.mockResolvedValueOnce({
        json: async () => ({ Response: 'True', Title: 'Test' })
      });

      const touchStartEvent = new Event('touchstart', {
        bubbles: true,
        cancelable: true
      });
      Object.defineProperty(touchStartEvent, 'target', {
        value: card,
        writable: false
      });
      card.dispatchEvent(touchStartEvent);

      const touchEndEvent = new Event('touchend', {
        bubbles: true,
        cancelable: true
      });
      Object.defineProperty(touchEndEvent, 'target', {
        value: card,
        writable: false
      });
      card.dispatchEvent(touchEndEvent);

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(bottomSheet.classList.contains('open')).toBe(true);
    });
  });

  describe('resultsContainer mouseover event', () => {
    it('should show hover details on desktop', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024
      });

      const movie = { imdbID: 'tt123', Title: 'Test', Type: 'movie', Poster: 'N/A' };
      const cardWrapper = createMovieCard(movie);
      resultsContainer.appendChild(cardWrapper);
      const card = cardWrapper.querySelector('.movie-card');

      global.fetch.mockResolvedValueOnce({
        json: async () => ({ Response: 'True', Title: 'Test' })
      });

      const mouseOverEvent = new MouseEvent('mouseover', {
        bubbles: true,
        relatedTarget: document.body
      });
      card.dispatchEvent(mouseOverEvent);

      await new Promise(resolve => setTimeout(resolve, 100));

      const detailsElement = cardWrapper.querySelector('.movie-details');
      expect(detailsElement.classList.contains('visible')).toBe(true);
    });
  });

  describe('resultsContainer mouseout event', () => {
    it('should hide hover details on mouseout', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024
      });

      const movie = { imdbID: 'tt123', Title: 'Test', Type: 'movie', Poster: 'N/A' };
      const cardWrapper = createMovieCard(movie);
      resultsContainer.appendChild(cardWrapper);
      const card = cardWrapper.querySelector('.movie-card');
      const detailsElement = cardWrapper.querySelector('.movie-details');

      global.fetch.mockResolvedValue({
        json: async () => ({ Response: 'True', Title: 'Test' })
      });

      const mouseOverEvent = new MouseEvent('mouseover', {
        bubbles: true,
        relatedTarget: document.body
      });
      card.dispatchEvent(mouseOverEvent);

      await new Promise(resolve => setTimeout(resolve, 100));

      const mouseOutEvent = new MouseEvent('mouseout', {
        bubbles: true,
        relatedTarget: document.body
      });
      card.dispatchEvent(mouseOutEvent);

      await new Promise(resolve => setTimeout(resolve, 200));

      expect(detailsElement.classList.contains('visible')).toBe(false);
    });
  });

  describe('closeBottomSheet click event', () => {
    it('should close bottom sheet when close button clicked', () => {
      bottomSheet.classList.add('open');
      overlay.classList.add('visible');

      closeBottomSheet.click();

      expect(bottomSheet.classList.contains('open')).toBe(false);
      expect(overlay.classList.contains('visible')).toBe(false);
    });
  });

  describe('overlay click event', () => {
    it('should close bottom sheet when overlay clicked', () => {
      bottomSheet.classList.add('open');
      overlay.classList.add('visible');

      overlay.click();

      expect(bottomSheet.classList.contains('open')).toBe(false);
      expect(overlay.classList.contains('visible')).toBe(false);
    });
  });

  describe('window resize event', () => {
    it('should update mobile state on resize', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024
      });

      const resizeEvent = new Event('resize');
      window.dispatchEvent(resizeEvent);

      expect(isMobileDevice()).toBe(false);

      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500
      });

      window.dispatchEvent(resizeEvent);

      expect(isMobileDevice()).toBe(true);
    });
  });

  describe('window keydown event', () => {
    it('should close bottom sheet on Escape key', () => {
      bottomSheet.classList.add('open');

      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
      window.dispatchEvent(escapeEvent);

      expect(bottomSheet.classList.contains('open')).toBe(false);
    });

    it('should handle Tab key focus trap', () => {
      bottomSheet.classList.add('open');
      const button1 = document.createElement('button');
      button1.id = 'btn1';
      const button2 = document.createElement('button');
      button2.id = 'btn2';
      bottomSheet.appendChild(button1);
      bottomSheet.appendChild(button2);
      button2.focus();

      const tabEvent = new KeyboardEvent('keydown', { 
        key: 'Tab', 
        bubbles: true,
        shiftKey: false,
        cancelable: true
      });
      Object.defineProperty(tabEvent, 'preventDefault', {
        value: vi.fn()
      });
      window.dispatchEvent(tabEvent);

      expect(tabEvent.preventDefault).toHaveBeenCalled();
    });

    it('should handle Shift+Tab focus trap', () => {
      bottomSheet.classList.add('open');
      const button1 = document.createElement('button');
      button1.id = 'btn1';
      const button2 = document.createElement('button');
      button2.id = 'btn2';
      bottomSheetContent.appendChild(button1);
      bottomSheetContent.appendChild(button2);
      
      const focusableElements = bottomSheet.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      firstElement.focus();

      const preventDefaultSpy = vi.fn();
      const shiftTabEvent = new KeyboardEvent('keydown', { 
        key: 'Tab', 
        bubbles: true,
        shiftKey: true,
        cancelable: true
      });
      Object.defineProperty(shiftTabEvent, 'preventDefault', {
        value: preventDefaultSpy,
        configurable: true
      });
      window.dispatchEvent(shiftTabEvent);

      if (document.activeElement === firstElement) {
        expect(preventDefaultSpy).toHaveBeenCalled();
      }
    });
  });
});

