import { describe, it, expect, beforeEach, beforeAll, vi, afterEach } from 'vitest';
import { setupDOM, clearDetailsCache } from './helpers.js';
import { showMovieDetails, showMovieDetailsOnHover, hideMovieDetailsOnHover, closeBottomSheetHandler, fetchMovieDetails, createMovieCard, formatDetailsForBottomSheet, previousActiveElement } from '../script.js';

let bottomSheet, bottomSheetTitle, bottomSheetContent, overlay, closeBottomSheet;

beforeAll(() => {
  setupDOM();
  bottomSheet = document.getElementById('bottomSheet');
  bottomSheetTitle = document.getElementById('bottomSheetTitle');
  bottomSheetContent = document.getElementById('bottomSheetContent');
  overlay = document.getElementById('overlay');
  closeBottomSheet = document.getElementById('closeBottomSheet');
});

beforeEach(() => {
  vi.clearAllMocks();
  global.fetch = vi.fn();
  window.fetch = global.fetch;
  clearDetailsCache();
  bottomSheet.classList.remove('open');
  bottomSheet.setAttribute('aria-hidden', 'true');
  overlay.classList.remove('visible');
  overlay.setAttribute('aria-hidden', 'true');
  bottomSheetContent.innerHTML = '';
  bottomSheetTitle.textContent = '';
  document.body.style.overflow = '';
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Details Functions', () => {
  describe('showMovieDetails', () => {
    it('should open bottom sheet with movie title', () => {
      global.fetch.mockResolvedValueOnce({
        json: async () => ({ Response: 'True', Title: 'Test Movie' })
      });
      window.fetch = global.fetch;
      
      const movieCard = createMovieCard({
        imdbID: 'tt1234567',
        Title: 'Test Movie',
        Type: 'movie',
        Poster: 'N/A'
      });
      const card = movieCard.querySelector('.movie-card');

      showMovieDetails('tt1234567', card);

      expect(bottomSheet.classList.contains('open')).toBe(true);
      expect(bottomSheet.getAttribute('aria-hidden')).toBe('false');
      expect(overlay.classList.contains('visible')).toBe(true);
      expect(overlay.getAttribute('aria-hidden')).toBe('false');
      expect(bottomSheetTitle.textContent).toBe('Test Movie');
      expect(document.body.style.overflow).toBe('hidden');
    });

    it('should display placeholder when poster is N/A', () => {
      global.fetch.mockResolvedValueOnce({
        json: async () => ({ Response: 'True', Title: 'Test Movie' })
      });
      window.fetch = global.fetch;
      
      const movieCard = createMovieCard({
        imdbID: 'tt1234567',
        Title: 'Test Movie',
        Type: 'movie',
        Poster: 'N/A'
      });
      const card = movieCard.querySelector('.movie-card');

      showMovieDetails('tt1234567', card);

      const placeholder = bottomSheetContent.querySelector('.poster-large');
      expect(placeholder).toBeTruthy();
      expect(placeholder.textContent).toBe('No Image');
      expect(placeholder.getAttribute('aria-label')).toBe('No poster available');
    });

    it('should display poster image when available', () => {
      global.fetch.mockResolvedValueOnce({
        json: async () => ({ Response: 'True', Title: 'Test Movie' })
      });
      window.fetch = global.fetch;
      
      const movieCard = createMovieCard({
        imdbID: 'tt1234567',
        Title: 'Test Movie',
        Type: 'movie',
        Poster: 'https://example.com/poster.jpg'
      });
      const card = movieCard.querySelector('.movie-card');

      showMovieDetails('tt1234567', card);

      const img = bottomSheetContent.querySelector('img.poster-large');
      expect(img).toBeTruthy();
      expect(img.src).toBe('https://example.com/poster.jpg');
    });

    it('should fetch and display movie details', async () => {
      const mockDetails = {
        Response: 'True',
        Title: 'Test Movie',
        Year: '2023',
        Plot: 'A great movie'
      };

      global.fetch.mockResolvedValueOnce({
        json: async () => mockDetails
      });

      const movieCard = createMovieCard({
        imdbID: 'tt1234567',
        Title: 'Test Movie',
        Type: 'movie',
        Poster: 'N/A'
      });
      const card = movieCard.querySelector('.movie-card');

      showMovieDetails('tt1234567', card);

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/details?i=tt1234567'
      );
    });

    it('should handle missing bottom sheet elements gracefully', () => {
      global.fetch.mockResolvedValueOnce({
        json: async () => ({ Response: 'True', Title: 'Test Movie' })
      });
      window.fetch = global.fetch;
      
      const movieCard = createMovieCard({
        imdbID: 'tt1234567',
        Title: 'Test Movie',
        Type: 'movie',
        Poster: 'N/A'
      });
      const card = movieCard.querySelector('.movie-card');

      expect(() => {
        showMovieDetails('tt1234567', card);
      }).not.toThrow();
      
      expect(bottomSheet.classList.contains('open')).toBe(true);
    });
  });

  describe('showMovieDetailsOnHover', () => {
    it('should show details container on hover', () => {
      const movieCard = createMovieCard({
        imdbID: 'tt1234567',
        Title: 'Test Movie',
        Type: 'movie',
        Poster: 'N/A'
      });
      const card = movieCard.querySelector('.movie-card');
      const detailsElement = movieCard.querySelector('.movie-details');

      global.fetch.mockResolvedValueOnce({
        json: async () => ({
          Response: 'True',
          Title: 'Test Movie',
          Year: '2023'
        })
      });

      showMovieDetailsOnHover('tt1234567', card);

      expect(detailsElement.classList.contains('visible')).toBe(true);
      expect(detailsElement.getAttribute('aria-hidden')).toBe('false');
    });

    it('should return early if wrapper not found', () => {
      const card = document.createElement('button');
      card.className = 'movie-card';

      showMovieDetailsOnHover('tt1234567', card);

      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should return early if details element not found', () => {
      const wrapper = document.createElement('div');
      wrapper.className = 'movie-card-wrapper';
      const card = document.createElement('button');
      card.className = 'movie-card';
      wrapper.appendChild(card);

      showMovieDetailsOnHover('tt1234567', card);

      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should position details on right side when space available', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 2000
      });

      const movieCard = createMovieCard({
        imdbID: 'tt1234567',
        Title: 'Test Movie',
        Type: 'movie',
        Poster: 'N/A'
      });
      const card = movieCard.querySelector('.movie-card');
      const detailsElement = movieCard.querySelector('.movie-details');

      vi.spyOn(card, 'getBoundingClientRect').mockReturnValue({
        right: 100,
        left: 0,
        top: 0,
        bottom: 0,
        width: 100,
        height: 100
      });

      global.fetch.mockResolvedValueOnce({
        json: async () => ({ Response: 'True', Title: 'Test Movie' })
      });

      showMovieDetailsOnHover('tt1234567', card);

      expect(detailsElement.classList.contains('right-side')).toBe(true);
      expect(detailsElement.classList.contains('left-side')).toBe(false);
    });
  });

  describe('hideMovieDetailsOnHover', () => {
    it('should hide visible details element', () => {
      global.fetch.mockResolvedValueOnce({
        json: async () => ({ Response: 'True', Title: 'Test Movie' })
      });
      window.fetch = global.fetch;
      
      const movieCard = createMovieCard({
        imdbID: 'tt1234567',
        Title: 'Test Movie',
        Type: 'movie',
        Poster: 'N/A'
      });
      const detailsElement = movieCard.querySelector('.movie-details');
      detailsElement.classList.add('visible');
      detailsElement.setAttribute('aria-hidden', 'false');

      showMovieDetailsOnHover('tt1234567', movieCard.querySelector('.movie-card'));

      hideMovieDetailsOnHover();

      expect(detailsElement.classList.contains('visible')).toBe(false);
      expect(detailsElement.getAttribute('aria-hidden')).toBe('true');
    });

    it('should handle when no current details element', () => {
      expect(() => hideMovieDetailsOnHover()).not.toThrow();
    });
  });

  describe('closeBottomSheetHandler', () => {
    it('should close bottom sheet and restore body overflow', () => {
      bottomSheet.classList.add('open');
      overlay.classList.add('visible');
      document.body.style.overflow = 'hidden';

      closeBottomSheetHandler();

      expect(bottomSheet.classList.contains('open')).toBe(false);
      expect(overlay.classList.contains('visible')).toBe(false);
      expect(bottomSheet.getAttribute('aria-hidden')).toBe('true');
      expect(overlay.getAttribute('aria-hidden')).toBe('true');
      expect(document.body.style.overflow).toBe('');
    });

    it('should restore focus to previous active element', async () => {
      global.fetch.mockResolvedValueOnce({
        json: async () => ({ Response: 'True', Title: 'Test Movie' })
      });
      window.fetch = global.fetch;
      
      const previousElement = document.createElement('button');
      previousElement.id = 'previous-btn';
      document.body.appendChild(previousElement);
      previousElement.focus();

      const movieCard = createMovieCard({
        imdbID: 'tt1234567',
        Title: 'Test Movie',
        Type: 'movie',
        Poster: 'N/A'
      });
      const card = movieCard.querySelector('.movie-card');

      showMovieDetails('tt1234567', card);
      
      await new Promise(resolve => setTimeout(resolve, 50));

      closeBottomSheetHandler();

      expect(document.activeElement).toBe(previousElement);
      
      document.body.removeChild(previousElement);
    });
  });
});

