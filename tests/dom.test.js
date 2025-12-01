import { describe, it, expect, beforeAll } from 'vitest';
import { setupDOM } from './helpers.js';
import { createMovieCard, createSkeletonCard, createSkeletonDetails, createElement } from '../script.js';

beforeAll(() => {
  setupDOM();
});

describe('DOM Manipulation Functions', () => {
  describe('createMovieCard', () => {
    it('should create a movie card with correct structure', () => {
      const movie = {
        imdbID: 'tt1234567',
        Title: 'Test Movie',
        Type: 'movie',
        Poster: 'https://example.com/poster.jpg'
      };

      const card = createMovieCard(movie);
      
      expect(card).toBeTruthy();
      expect(card.className).toBe('movie-card-wrapper');
      expect(card.children.length).toBe(2);
      
      const button = card.querySelector('.movie-card');
      expect(button).toBeTruthy();
      expect(button.dataset.imdbId).toBe('tt1234567');
      expect(button.type).toBe('button');
      expect(button.getAttribute('aria-label')).toBe('View details for Test Movie, movie');
      
      const poster = button.querySelector('.poster');
      expect(poster).toBeTruthy();
      expect(poster.src).toBe('https://example.com/poster.jpg');
      expect(poster.alt).toBe('Poster for Test Movie');
      
      const title = button.querySelector('.title');
      expect(title).toBeTruthy();
      expect(title.textContent).toBe('Test Movie');
      
      const type = button.querySelector('.type');
      expect(type).toBeTruthy();
      expect(type.textContent).toBe('movie');
      
      const detailsContainer = card.querySelector('.movie-details');
      expect(detailsContainer).toBeTruthy();
      expect(detailsContainer.dataset.imdbId).toBe('tt1234567');
      expect(detailsContainer.getAttribute('aria-hidden')).toBe('true');
    });

    it('should handle N/A poster correctly', () => {
      const movie = {
        imdbID: 'tt1234567',
        Title: 'Test Movie',
        Type: 'movie',
        Poster: 'N/A'
      };

      const card = createMovieCard(movie);
      const poster = card.querySelector('.poster');
      
      expect(poster.src).not.toContain('example.com');
      expect(poster.alt).toBe('');
      expect(poster.getAttribute('aria-hidden')).toBe('true');
    });

    it('should create details container with correct attributes', () => {
      const movie = {
        imdbID: 'tt1234567',
        Title: 'Test Movie',
        Type: 'series',
        Poster: 'https://example.com/poster.jpg'
      };

      const card = createMovieCard(movie);
      const detailsContainer = card.querySelector('.movie-details');
      
      expect(detailsContainer.getAttribute('role')).toBe('tooltip');
      expect(detailsContainer.getAttribute('aria-live')).toBe('polite');
      expect(detailsContainer.getAttribute('aria-atomic')).toBe('true');
    });
  });

  describe('createSkeletonCard', () => {
    it('should create a skeleton card with correct structure', () => {
      const skeleton = createSkeletonCard();
      
      expect(skeleton).toBeTruthy();
      expect(skeleton.className).toBe('movie-card-wrapper');
      expect(skeleton.children.length).toBe(1);
      
      const card = skeleton.querySelector('.movie-card');
      expect(card).toBeTruthy();
      expect(card.className).toBe('movie-card skeleton-card');
      
      const poster = card.querySelector('.poster');
      expect(poster).toBeTruthy();
      expect(poster.className).toContain('skeleton');
      expect(poster.className).toContain('skeleton-poster');
      
      const movieInfo = card.querySelector('.movie-info');
      expect(movieInfo).toBeTruthy();
      
      const title = movieInfo.querySelector('.title');
      expect(title).toBeTruthy();
      expect(title.className).toContain('skeleton');
      expect(title.className).toContain('skeleton-title');
      
      const type = movieInfo.querySelector('.type');
      expect(type).toBeTruthy();
      expect(type.className).toContain('skeleton');
      expect(type.className).toContain('skeleton-type');
    });
  });

  describe('createSkeletonDetails', () => {
    it('should create skeleton details fragment with correct structure', () => {
      const fragment = createSkeletonDetails();
      
      expect(fragment).toBeTruthy();
      expect(fragment.children.length).toBe(7);
      
      const rows = Array.from(fragment.querySelectorAll('.detail-row'));
      expect(rows.length).toBe(6);
      
      rows.forEach((row, index) => {
        const label = row.querySelector('strong');
        const value = row.querySelector('span');
        
        expect(label).toBeTruthy();
        expect(label.className).toContain('skeleton');
        expect(label.className).toContain('skeleton-label');
        
        expect(value).toBeTruthy();
        expect(value.className).toContain('skeleton');
        expect(value.className).toContain('skeleton-value');
        
        if (index >= 3) {
          expect(value.className).toContain('skeleton-value-long');
        }
      });
      
      const plot = fragment.querySelector('.plot');
      expect(plot).toBeTruthy();
      expect(plot.style.marginTop).toBe('15px');
      
      const plotLines = plot.querySelectorAll('.skeleton-line');
      expect(plotLines.length).toBe(3);
      expect(plotLines[2].className).toContain('skeleton-line-short');
    });
  });
});

