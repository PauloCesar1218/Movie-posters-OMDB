import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setupDOM } from './helpers.js';
import { debounce, isMobileDevice, createElement, clearContainer } from '../script.js';

beforeAll(() => {
  setupDOM();
});

describe('Utility Functions', () => {
  describe('debounce', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should delay function execution', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 500);

      debouncedFn();
      expect(mockFn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(500);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should cancel previous calls when called multiple times', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 500);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      vi.advanceTimersByTime(500);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('isMobileDevice', () => {
    it('should return true when window width is <= 768', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768
      });
      expect(isMobileDevice()).toBe(true);
    });

    it('should return false when window width is > 768', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024
      });
      expect(isMobileDevice()).toBe(false);
    });
  });

  describe('createElement', () => {
    it('should create an element with tag name', () => {
      const element = createElement('div');
      expect(element.tagName).toBe('DIV');
    });

    it('should add className when provided', () => {
      const element = createElement('div', 'test-class');
      expect(element.className).toBe('test-class');
    });

    it('should set textContent when provided', () => {
      const element = createElement('div', null, 'Test content');
      expect(element.textContent).toBe('Test content');
    });

    it('should handle all parameters together', () => {
      const element = createElement('span', 'my-class', 'Hello');
      expect(element.tagName).toBe('SPAN');
      expect(element.className).toBe('my-class');
      expect(element.textContent).toBe('Hello');
    });
  });

  describe('clearContainer', () => {
    it('should remove all children from container', () => {
      const container = document.createElement('div');
      container.appendChild(document.createElement('span'));
      container.appendChild(document.createElement('div'));
      
      expect(container.children.length).toBe(2);
      clearContainer(container);
      expect(container.children.length).toBe(0);
    });

    it('should handle empty container', () => {
      const container = document.createElement('div');
      clearContainer(container);
      expect(container.children.length).toBe(0);
    });
  });
});

