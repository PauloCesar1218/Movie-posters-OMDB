import { describe, it, expect, beforeEach, beforeAll, vi, afterEach } from 'vitest';
import { loadScriptFunctions, setupDOM } from './helpers.js';

let announceToScreenReader, createMovieCard;
let screenReaderAnnouncements;

beforeAll(() => {
  setupDOM();
  const functions = loadScriptFunctions();
  announceToScreenReader = functions.announceToScreenReader;
  createMovieCard = functions.createMovieCard;
  
  screenReaderAnnouncements = document.getElementById('screenReaderAnnouncements');
});

beforeEach(() => {
  vi.useFakeTimers();
  screenReaderAnnouncements.textContent = '';
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Accessibility Functions', () => {
  describe('announceToScreenReader', () => {
    it('should announce message to screen reader', () => {
      announceToScreenReader('Test message');

      vi.advanceTimersByTime(100);
      expect(screenReaderAnnouncements.textContent).toBe('Test message');
    });

    it('should clear message after 2 seconds', () => {
      announceToScreenReader('Test message');

      vi.advanceTimersByTime(100);
      expect(screenReaderAnnouncements.textContent).toBe('Test message');

      vi.advanceTimersByTime(2000);
      expect(screenReaderAnnouncements.textContent).toBe('');
    });

    it('should handle when screenReaderAnnouncements element is missing', () => {
      const originalElement = screenReaderAnnouncements;
      screenReaderAnnouncements.remove();

      expect(() => announceToScreenReader('Test message')).not.toThrow();

      document.body.appendChild(originalElement);
    });

    it('should clear previous content before setting new message', () => {
      screenReaderAnnouncements.textContent = 'Previous message';
      
      announceToScreenReader('New message');

      expect(screenReaderAnnouncements.textContent).toBe('');

      vi.advanceTimersByTime(100);
      expect(screenReaderAnnouncements.textContent).toBe('New message');
    });
  });

  describe('createMovieCard accessibility', () => {
    it('should set correct aria-label on movie card button', () => {
      const movie = {
        imdbID: 'tt1234567',
        Title: 'Test Movie',
        Type: 'movie',
        Poster: 'N/A'
      };

      const card = createMovieCard(movie);
      const button = card.querySelector('.movie-card');

      expect(button.getAttribute('aria-label')).toBe('View details for Test Movie, movie');
      expect(button.getAttribute('tabindex')).toBe('0');
    });

    it('should set aria-hidden on poster when N/A', () => {
      const movie = {
        imdbID: 'tt1234567',
        Title: 'Test Movie',
        Type: 'movie',
        Poster: 'N/A'
      };

      const card = createMovieCard(movie);
      const poster = card.querySelector('.poster');

      expect(poster.getAttribute('aria-hidden')).toBe('true');
    });

    it('should not set aria-hidden on poster when available', () => {
      const movie = {
        imdbID: 'tt1234567',
        Title: 'Test Movie',
        Type: 'movie',
        Poster: 'https://example.com/poster.jpg'
      };

      const card = createMovieCard(movie);
      const poster = card.querySelector('.poster');

      expect(poster.getAttribute('aria-hidden')).toBe('false');
    });

    it('should set correct alt text on poster image', () => {
      const movie = {
        imdbID: 'tt1234567',
        Title: 'Test Movie',
        Type: 'movie',
        Poster: 'https://example.com/poster.jpg'
      };

      const card = createMovieCard(movie);
      const poster = card.querySelector('.poster');

      expect(poster.alt).toBe('Poster for Test Movie');
    });

    it('should set correct aria attributes on details container', () => {
      const movie = {
        imdbID: 'tt1234567',
        Title: 'Test Movie',
        Type: 'movie',
        Poster: 'N/A'
      };

      const card = createMovieCard(movie);
      const detailsContainer = card.querySelector('.movie-details');

      expect(detailsContainer.getAttribute('role')).toBe('tooltip');
      expect(detailsContainer.getAttribute('aria-live')).toBe('polite');
      expect(detailsContainer.getAttribute('aria-atomic')).toBe('true');
      expect(detailsContainer.getAttribute('aria-hidden')).toBe('true');
    });
  });
});

