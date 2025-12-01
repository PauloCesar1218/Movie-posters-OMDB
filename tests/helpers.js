import * as scriptFunctions from '../script.js';
import { detailsCache } from '../script.js';

export function clearDetailsCache() {
  Object.keys(detailsCache).forEach(key => {
    delete detailsCache[key];
  });
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

export { scriptFunctions };
