import { vi } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf-8');
const dom = new JSDOM(html, {
  url: 'http://localhost',
  pretendToBeVisual: true,
  resources: 'usable',
  runScripts: 'outside-only',
  beforeParse(window) {
    window.console = global.console;
  }
});

dom.window.addEventListener('error', (event) => {
  if (event.message && (
    event.message.includes('Could not load link') || 
    event.message.includes('Could not load script') ||
    event.message.includes('ECONNREFUSED')
  )) {
    event.preventDefault();
  }
});

global.window = dom.window;
global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement;
global.Element = dom.window.Element;
global.Node = dom.window.Node;
global.fetch = vi.fn();
global.navigator = dom.window.navigator;

Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1024
});

Object.defineProperty(window, 'innerHeight', {
  writable: true,
  configurable: true,
  value: 768
});

global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}));

