import { describe, it, expect, beforeEach, beforeAll, vi } from 'vitest';
import { loadScriptFunctions, setupDOM } from './helpers.js';

let displayResults, displayNoResults, showLoading, hideLoading, createMovieCard, clearContainer;
let resultsContainer, loadingIndicator;

beforeAll(() => {
  setupDOM();
  const functions = loadScriptFunctions();
  displayResults = functions.displayResults;
  displayNoResults = functions.displayNoResults;
  showLoading = functions.showLoading;
  hideLoading = functions.hideLoading;
  createMovieCard = functions.createMovieCard;
  clearContainer = functions.clearContainer;
  
  resultsContainer = document.getElementById('resultsContainer');
  loadingIndicator = document.getElementById('loadingIndicator');
});

beforeEach(() => {
  clearContainer(resultsContainer);
  loadingIndicator.classList.add('hidden');
  loadingIndicator.textContent = '';
});

describe('Display Functions', () => {
  describe('displayResults', () => {
    it('should display multiple movie cards', () => {
      const movies = [
        { imdbID: 'tt1', Title: 'Movie 1', Type: 'movie', Poster: 'N/A' },
        { imdbID: 'tt2', Title: 'Movie 2', Type: 'movie', Poster: 'N/A' },
        { imdbID: 'tt3', Title: 'Movie 3', Type: 'series', Poster: 'N/A' }
      ];

      displayResults(movies);

      const cards = resultsContainer.querySelectorAll('.movie-card-wrapper');
      expect(cards.length).toBe(3);
      
      const titles = Array.from(resultsContainer.querySelectorAll('.title'));
      expect(titles[0].textContent).toBe('Movie 1');
      expect(titles[1].textContent).toBe('Movie 2');
      expect(titles[2].textContent).toBe('Movie 3');
    });

    it('should clear container before displaying new results', () => {
      const existingDiv = document.createElement('div');
      existingDiv.className = 'existing-content';
      existingDiv.textContent = 'Existing content';
      resultsContainer.appendChild(existingDiv);

      const movies = [
        { imdbID: 'tt1', Title: 'New Movie', Type: 'movie', Poster: 'N/A' }
      ];

      displayResults(movies);

      expect(resultsContainer.querySelector('.existing-content')).toBeNull();
      expect(resultsContainer.querySelectorAll('.movie-card-wrapper').length).toBe(1);
    });

    it('should handle empty array', () => {
      displayResults([]);
      expect(resultsContainer.children.length).toBe(0);
    });
  });

  describe('displayNoResults', () => {
    it('should display no results message', () => {
      displayNoResults();

      const noResults = resultsContainer.querySelector('.no-results');
      expect(noResults).toBeTruthy();
      expect(noResults.textContent).toBe('No results found. Try a different search term.');
    });

    it('should clear container before showing no results', () => {
      const existingDiv = document.createElement('div');
      resultsContainer.appendChild(existingDiv);

      displayNoResults();

      expect(resultsContainer.children.length).toBe(1);
      expect(resultsContainer.querySelector('.no-results')).toBeTruthy();
    });
  });

  describe('showLoading', () => {
    it('should show loading indicator and skeleton cards', () => {
      showLoading();

      expect(loadingIndicator.classList.contains('hidden')).toBe(false);
      expect(loadingIndicator.textContent).toBe('Loading movies...');
      
      const skeletonCards = resultsContainer.querySelectorAll('.skeleton-card');
      expect(skeletonCards.length).toBe(8);
    });

    it('should clear container before showing loading', () => {
      const existingDiv = document.createElement('div');
      existingDiv.className = 'existing-content';
      resultsContainer.appendChild(existingDiv);

      showLoading();

      expect(resultsContainer.querySelector('.existing-content')).toBeNull();
      expect(resultsContainer.querySelectorAll('.skeleton-card').length).toBe(8);
    });
  });

  describe('hideLoading', () => {
    it('should hide loading indicator and remove skeleton cards', () => {
      showLoading();
      expect(loadingIndicator.classList.contains('hidden')).toBe(false);
      expect(resultsContainer.querySelectorAll('.skeleton-card').length).toBe(8);

      hideLoading();

      expect(loadingIndicator.classList.contains('hidden')).toBe(true);
      expect(resultsContainer.querySelectorAll('.skeleton-card').length).toBe(0);
    });

    it('should handle when no skeleton cards exist', () => {
      hideLoading();
      expect(loadingIndicator.classList.contains('hidden')).toBe(true);
    });
  });
});

