import { describe, it, expect, beforeAll } from 'vitest';
import { loadScriptFunctions, setupDOM } from './helpers.js';

let formatDetailsForHover, formatDetailsForBottomSheet, createElement;

beforeAll(() => {
  setupDOM();
  const functions = loadScriptFunctions();
  formatDetailsForHover = functions.formatDetailsForHover;
  formatDetailsForBottomSheet = functions.formatDetailsForBottomSheet;
  createElement = functions.createElement;
});

describe('Formatting Functions', () => {
  describe('formatDetailsForHover', () => {
    it('should format complete movie details', () => {
      const details = {
        Year: '2023',
        Rated: 'PG-13',
        Runtime: '120 min',
        Genre: 'Action, Drama',
        Director: 'John Doe',
        Actors: 'Actor 1, Actor 2',
        imdbRating: '8.5',
        Plot: 'A great movie plot'
      };

      const fragment = formatDetailsForHover(details);
      const container = document.createElement('div');
      container.appendChild(fragment);

      const rows = container.querySelectorAll('.detail-row');
      expect(rows.length).toBe(7);

      expect(rows[0].textContent).toContain('Year:');
      expect(rows[0].textContent).toContain('2023');
      expect(rows[1].textContent).toContain('Rated:');
      expect(rows[1].textContent).toContain('PG-13');
      expect(rows[6].textContent).toContain('IMDB Rating:');
      expect(rows[6].textContent).toContain('8.5');

      const plot = container.querySelector('.plot');
      expect(plot).toBeTruthy();
      expect(plot.textContent).toBe('A great movie plot');
    });

    it('should only include fields with values', () => {
      const details = {
        Year: '2023',
        Rated: '',
        Runtime: '120 min',
        Genre: null,
        Director: 'John Doe'
      };

      const fragment = formatDetailsForHover(details);
      const container = document.createElement('div');
      container.appendChild(fragment);

      const rows = container.querySelectorAll('.detail-row');
      expect(rows.length).toBe(3);
      expect(rows[0].textContent).toContain('Year:');
      expect(rows[1].textContent).toContain('Runtime:');
      expect(rows[2].textContent).toContain('Director:');
    });

    it('should handle N/A plot', () => {
      const details = {
        Year: '2023',
        Plot: 'N/A'
      };

      const fragment = formatDetailsForHover(details);
      const container = document.createElement('div');
      container.appendChild(fragment);

      const plot = container.querySelector('.plot');
      expect(plot).toBeNull();
    });

    it('should display error message when Error is present', () => {
      const details = {
        Error: 'Movie not found'
      };

      const fragment = formatDetailsForHover(details);
      const container = document.createElement('div');
      container.appendChild(fragment);

      expect(container.textContent).toBe('Movie not found');
      expect(container.querySelector('.detail-row')).toBeNull();
    });

    it('should display no details message when no fields available', () => {
      const details = {};

      const fragment = formatDetailsForHover(details);
      const container = document.createElement('div');
      container.appendChild(fragment);

      expect(container.textContent).toContain('No details available');
    });
  });

  describe('formatDetailsForBottomSheet', () => {
    it('should format complete movie details for bottom sheet', () => {
      const details = {
        Title: 'Test Movie',
        Year: '2023',
        Rated: 'PG-13',
        Released: '2023-01-01',
        Runtime: '120 min',
        Genre: 'Action, Drama',
        Director: 'John Doe',
        Writer: 'Jane Smith',
        Actors: 'Actor 1, Actor 2',
        Language: 'English',
        Country: 'USA',
        Awards: 'Oscar Winner',
        imdbRating: '8.5',
        imdbVotes: '100,000',
        BoxOffice: '$100M',
        Plot: 'A great movie plot',
        Poster: 'https://example.com/poster.jpg'
      };

      const fragment = formatDetailsForBottomSheet(details);
      const container = document.createElement('div');
      container.appendChild(fragment);

      const poster = container.querySelector('img.poster-large');
      expect(poster).toBeTruthy();
      expect(poster.src).toBe('https://example.com/poster.jpg');
      expect(poster.alt).toBe('Poster for Test Movie');

      const sections = container.querySelectorAll('.detail-section');
      expect(sections.length).toBeGreaterThan(10);

      const yearSection = Array.from(sections).find(s => s.textContent.includes('Year:'));
      expect(yearSection).toBeTruthy();
      expect(yearSection.querySelector('.detail-label').textContent).toBe('Year:');
      expect(yearSection.querySelector('.detail-value').textContent).toBe('2023');

      const plotSection = Array.from(sections).find(s => s.textContent.includes('Plot:'));
      expect(plotSection).toBeTruthy();
      expect(plotSection.querySelector('.detail-value').textContent).toBe('A great movie plot');
    });

    it('should exclude N/A values', () => {
      const details = {
        Year: '2023',
        Rated: 'N/A',
        Runtime: '120 min',
        Genre: 'N/A',
        Director: 'John Doe'
      };

      const fragment = formatDetailsForBottomSheet(details);
      const container = document.createElement('div');
      container.appendChild(fragment);

      const sections = container.querySelectorAll('.detail-section');
      const sectionTexts = Array.from(sections).map(s => s.textContent);
      
      expect(sectionTexts.some(text => text.includes('Rated:'))).toBe(false);
      expect(sectionTexts.some(text => text.includes('Genre:'))).toBe(false);
      expect(sectionTexts.some(text => text.includes('Year:'))).toBe(true);
      expect(sectionTexts.some(text => text.includes('Director:'))).toBe(true);
    });

    it('should handle N/A poster', () => {
      const details = {
        Title: 'Test Movie',
        Year: '2023',
        Poster: 'N/A'
      };

      const fragment = formatDetailsForBottomSheet(details);
      const container = document.createElement('div');
      container.appendChild(fragment);

      const poster = container.querySelector('img.poster-large');
      expect(poster).toBeNull();
    });

    it('should display error message when Error is present', () => {
      const details = {
        Error: 'Movie not found'
      };

      const fragment = formatDetailsForBottomSheet(details);
      const container = document.createElement('div');
      container.appendChild(fragment);

      const section = container.querySelector('.detail-section');
      expect(section).toBeTruthy();
      expect(section.querySelector('.detail-value').textContent).toBe('Movie not found');
    });

    it('should display no details message when no fields available', () => {
      const details = {};

      const fragment = formatDetailsForBottomSheet(details);
      const container = document.createElement('div');
      container.appendChild(fragment);

      const section = container.querySelector('.detail-section');
      expect(section).toBeTruthy();
      expect(section.querySelector('.detail-value').textContent).toBe('No details available');
    });

    it('should handle empty string values', () => {
      const details = {
        Year: '2023',
        Rated: '',
        Runtime: '120 min'
      };

      const fragment = formatDetailsForBottomSheet(details);
      const container = document.createElement('div');
      container.appendChild(fragment);

      const sections = container.querySelectorAll('.detail-section');
      const sectionTexts = Array.from(sections).map(s => s.textContent);
      
      expect(sectionTexts.some(text => text.includes('Rated:'))).toBe(false);
      expect(sectionTexts.some(text => text.includes('Year:'))).toBe(true);
    });
  });
});

