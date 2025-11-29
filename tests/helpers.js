import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { vi } from 'vitest';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let functionsLoaded = false;
let scriptFunctions = {};

export function clearDetailsCache() {
  if (window.detailsCache) {
    Object.keys(window.detailsCache).forEach(key => {
      delete window.detailsCache[key];
    });
  }
}

export function loadScriptFunctions(reload = false) {
  if (functionsLoaded && !reload) {
    window.fetch = global.fetch;
    return scriptFunctions;
  }
  
  functionsLoaded = false;

  let scriptContent = fs.readFileSync(path.join(__dirname, '../script.js'), 'utf-8');
  
  if (!global.fetch) {
    global.fetch = vi.fn();
  }
  
  window.fetch = global.fetch;
  
  scriptContent = scriptContent.replace(/\bfetch\(/g, 'window.fetch(');
  scriptContent = scriptContent.replace(/let detailsCache = \{\};/g, 'if (!window.detailsCache) window.detailsCache = {};');
  scriptContent = scriptContent.replace(/\bdetailsCache\[/g, 'window.detailsCache[');
  scriptContent = scriptContent.replace(/detailsCache\[/g, 'window.detailsCache[');
  
  const scriptFunction = new Function(
    'document',
    'window',
    'HTMLElement',
    'Element',
    'Node',
    `
    if (!window.detailsCache) {
      window.detailsCache = {};
    }
    ${scriptContent}
    return {
      debounce: typeof debounce !== 'undefined' ? debounce : null,
      isMobileDevice: typeof isMobileDevice !== 'undefined' ? isMobileDevice : null,
      createElement: typeof createElement !== 'undefined' ? createElement : null,
      clearContainer: typeof clearContainer !== 'undefined' ? clearContainer : null,
      announceToScreenReader: typeof announceToScreenReader !== 'undefined' ? announceToScreenReader : null,
      createMovieCard: typeof createMovieCard !== 'undefined' ? createMovieCard : null,
      createSkeletonCard: typeof createSkeletonCard !== 'undefined' ? createSkeletonCard : null,
      createSkeletonDetails: typeof createSkeletonDetails !== 'undefined' ? createSkeletonDetails : null,
      displayResults: typeof displayResults !== 'undefined' ? displayResults : null,
      displayNoResults: typeof displayNoResults !== 'undefined' ? displayNoResults : null,
      showLoading: typeof showLoading !== 'undefined' ? showLoading : null,
      hideLoading: typeof hideLoading !== 'undefined' ? hideLoading : null,
      searchMovies: typeof searchMovies !== 'undefined' ? searchMovies : null,
      fetchMovieDetails: typeof fetchMovieDetails !== 'undefined' ? fetchMovieDetails : null,
      formatDetailsForHover: typeof formatDetailsForHover !== 'undefined' ? formatDetailsForHover : null,
      formatDetailsForBottomSheet: typeof formatDetailsForBottomSheet !== 'undefined' ? formatDetailsForBottomSheet : null,
      showMovieDetails: typeof showMovieDetails !== 'undefined' ? showMovieDetails : null,
      showMovieDetailsOnHover: typeof showMovieDetailsOnHover !== 'undefined' ? showMovieDetailsOnHover : null,
      hideMovieDetailsOnHover: typeof hideMovieDetailsOnHover !== 'undefined' ? hideMovieDetailsOnHover : null,
      closeBottomSheetHandler: typeof closeBottomSheetHandler !== 'undefined' ? closeBottomSheetHandler : null
    };
    `
  );
  
  scriptFunctions = scriptFunction(document, window, HTMLElement, Element, Node);
  functionsLoaded = true;
  
  return scriptFunctions;
}

export function setupDOM() {
  const searchInput = document.getElementById('searchInput');
  const resultsContainer = document.getElementById('resultsContainer');
  const loadingIndicator = document.getElementById('loadingIndicator');
  const bottomSheet = document.getElementById('bottomSheet');
  const bottomSheetTitle = document.getElementById('bottomSheetTitle');
  const bottomSheetContent = document.getElementById('bottomSheetContent');
  const closeBottomSheet = document.getElementById('closeBottomSheet');
  const overlay = document.getElementById('overlay');
  const screenReaderAnnouncements = document.getElementById('screenReaderAnnouncements');

  if (!searchInput) {
    const input = document.createElement('input');
    input.id = 'searchInput';
    document.body.appendChild(input);
  }

  if (!resultsContainer) {
    const container = document.createElement('div');
    container.id = 'resultsContainer';
    document.body.appendChild(container);
  }

  if (!loadingIndicator) {
    const indicator = document.createElement('div');
    indicator.id = 'loadingIndicator';
    indicator.className = 'hidden';
    document.body.appendChild(indicator);
  }

  if (!bottomSheet) {
    const sheet = document.createElement('div');
    sheet.id = 'bottomSheet';
    sheet.setAttribute('aria-hidden', 'true');
    document.body.appendChild(sheet);
    
    const header = document.createElement('div');
    header.className = 'bottom-sheet-header';
    const title = document.createElement('h2');
    title.id = 'bottomSheetTitle';
    const closeBtn = document.createElement('button');
    closeBtn.id = 'closeBottomSheet';
    header.appendChild(title);
    header.appendChild(closeBtn);
    sheet.appendChild(header);
    
    const content = document.createElement('div');
    content.id = 'bottomSheetContent';
    sheet.appendChild(content);
  }

  if (!overlay) {
    const overlayEl = document.createElement('div');
    overlayEl.id = 'overlay';
    overlayEl.className = 'hidden';
    overlayEl.setAttribute('aria-hidden', 'true');
    document.body.appendChild(overlayEl);
  }

  if (!screenReaderAnnouncements) {
    const announcements = document.createElement('div');
    announcements.id = 'screenReaderAnnouncements';
    announcements.className = 'visually-hidden';
    announcements.setAttribute('role', 'status');
    announcements.setAttribute('aria-live', 'assertive');
    announcements.setAttribute('aria-atomic', 'true');
    document.body.appendChild(announcements);
  }
}

