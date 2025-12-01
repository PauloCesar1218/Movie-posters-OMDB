import { describe, it, expect, beforeEach, beforeAll, vi, afterEach } from 'vitest';
import { setupDOM, clearDetailsCache } from './helpers.js';
import { searchMovies, fetchMovieDetails, displayResults, displayNoResults, showLoading, hideLoading, announceToScreenReader } from '../script.js';

let resultsContainer, screenReaderAnnouncements;

beforeAll(() => {
  setupDOM();
  resultsContainer = document.getElementById('resultsContainer');
  screenReaderAnnouncements = document.getElementById('screenReaderAnnouncements');
});

beforeEach(() => {
  vi.clearAllMocks();
  global.fetch = vi.fn();
  window.fetch = global.fetch;
  clearDetailsCache();
  resultsContainer.innerHTML = '';
  screenReaderAnnouncements.textContent = '';
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('API Functions', () => {
  describe('searchMovies', () => {
    it('should not search when query is less than 3 characters', async () => {
      await searchMovies('ab');
      
      expect(global.fetch).not.toHaveBeenCalled();
      expect(resultsContainer.children.length).toBe(0);
    });

    it('should not search when query is empty', async () => {
      await searchMovies('');
      await searchMovies('   ');
      
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should search and display results for valid query', async () => {
      const mockMovies = {
        Response: 'True',
        Search: [
          { imdbID: 'tt1', Title: 'Movie 1', Type: 'movie', Poster: 'N/A' },
          { imdbID: 'tt2', Title: 'Movie 2', Type: 'movie', Poster: 'N/A' }
        ]
      };

      global.fetch.mockResolvedValueOnce({
        json: async () => mockMovies
      });

      await searchMovies('test query');

      expect(global.fetch).toHaveBeenCalled();
      const callArgs = global.fetch.mock.calls[0][0];
      expect(callArgs).toContain('test%20query');
      
      await new Promise(resolve => setTimeout(resolve, 100));
      const cards = resultsContainer.querySelectorAll('.movie-card-wrapper');
      expect(cards.length).toBe(2);
    });

    it('should display no results when Response is False', async () => {
      global.fetch.mockResolvedValueOnce({
        json: async () => ({ Response: 'False', Error: 'Movie not found!' })
      });

      await searchMovies('nonexistent');

      const noResults = resultsContainer.querySelector('.no-results');
      expect(noResults).toBeTruthy();
    });

    it('should display no results when Search is empty', async () => {
      global.fetch.mockResolvedValueOnce({
        json: async () => ({ Response: 'True', Search: null })
      });

      await searchMovies('test');

      const noResults = resultsContainer.querySelector('.no-results');
      expect(noResults).toBeTruthy();
    });

    it('should handle fetch errors', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      await searchMovies('test');

      const errorDiv = resultsContainer.querySelector('.no-results');
      expect(errorDiv).toBeTruthy();
      expect(errorDiv.textContent).toContain('Error searching movies');
      
      consoleErrorSpy.mockRestore();
    });

    it('should show and hide loading indicator', async () => {
      const loadingIndicator = document.getElementById('loadingIndicator');
      loadingIndicator.classList.add('hidden');

      global.fetch.mockResolvedValueOnce({
        json: async () => ({ Response: 'True', Search: [] })
      });

      const searchPromise = searchMovies('test');
      
      expect(loadingIndicator.classList.contains('hidden')).toBe(false);
      
      await searchPromise;
      
      expect(loadingIndicator.classList.contains('hidden')).toBe(true);
    });
  });

  describe('fetchMovieDetails', () => {
    it('should fetch movie details from API', async () => {
      const mockDetails = {
        Response: 'True',
        Title: 'Test Movie',
        Year: '2023',
        imdbID: 'tt1234567'
      };

      global.fetch.mockResolvedValueOnce({
        json: async () => mockDetails
      });
      window.fetch = global.fetch;

      const callback = vi.fn();
      await new Promise((resolve) => {
        fetchMovieDetails('tt1234567', (details) => {
          callback(details);
          resolve();
        });
      });

      expect(global.fetch).toHaveBeenCalled();
      const callUrl = global.fetch.mock.calls[0][0];
      expect(callUrl).toContain('tt1234567');
      expect(callback).toHaveBeenCalledWith(mockDetails);
    });

    it('should cache movie details', async () => {
      clearDetailsCache();
      const mockDetails = {
        Response: 'True',
        Title: 'Test Movie',
        Year: '2023',
        imdbID: 'tt1234567'
      };

      global.fetch.mockResolvedValueOnce({
        json: async () => mockDetails
      });
      window.fetch = global.fetch;

      const callback1 = vi.fn();
      const callback2 = vi.fn();

      await new Promise((resolve) => {
        fetchMovieDetails('tt1234567', (details) => {
          callback1(details);
          resolve();
        });
      });

      await new Promise((resolve) => {
        fetchMovieDetails('tt1234567', (details) => {
          callback2(details);
          resolve();
        });
      });

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(callback1).toHaveBeenCalledWith(mockDetails);
      expect(callback2).toHaveBeenCalledWith(mockDetails);
    });

    it('should not cache when Response is False', async () => {
      clearDetailsCache();
      global.fetch.mockResolvedValue({
        json: async () => ({ Response: 'False', Error: 'Not found' })
      });
      window.fetch = global.fetch;

      const callback1 = vi.fn();
      const callback2 = vi.fn();

      await new Promise((resolve) => {
        fetchMovieDetails('tt9999999', (details) => {
          callback1(details);
          setTimeout(resolve, 100);
        });
        setTimeout(resolve, 1000);
      });

      await new Promise((resolve) => {
        fetchMovieDetails('tt9999999', (details) => {
          callback2(details);
          setTimeout(resolve, 100);
        });
        setTimeout(resolve, 1000);
      });

      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).not.toHaveBeenCalled();
    }, 10000);

    it('should handle fetch errors', async () => {
      clearDetailsCache();
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      global.fetch.mockRejectedValueOnce(new Error('Network error'));
      window.fetch = global.fetch;

      const callback = vi.fn();
      await new Promise((resolve) => {
        fetchMovieDetails('tt8888888', (details) => {
          callback(details);
          resolve();
        });
      });

      expect(callback).toHaveBeenCalledWith({ Error: 'Failed to load details' });
      
      consoleErrorSpy.mockRestore();
    });

    it('should handle callback when fetch fails', async () => {
      clearDetailsCache();
      global.fetch.mockRejectedValueOnce(new Error('Network error'));
      window.fetch = global.fetch;

      const callback = vi.fn();
      await new Promise((resolve) => {
        fetchMovieDetails('tt7777777', (details) => {
          callback(details);
          resolve();
        });
      });

      expect(callback).toHaveBeenCalled();
      expect(callback.mock.calls[0][0].Error).toBe('Failed to load details');
    });
  });
});

