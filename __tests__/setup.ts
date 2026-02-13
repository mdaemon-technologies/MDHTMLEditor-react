// Jest test setup for React
import '@testing-library/jest-dom';

// Mock window.getSelection
Object.defineProperty(window, 'getSelection', {
  value: () => ({
    removeAllRanges: () => {},
    addRange: () => {},
    getRangeAt: () => ({
      commonAncestorContainer: document.body,
      startContainer: document.body,
      endContainer: document.body,
      startOffset: 0,
      endOffset: 0,
    }),
    rangeCount: 0,
  }),
});

// Mock ResizeObserver
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = ResizeObserver;

// Mock IntersectionObserver
class IntersectionObserver {
  root = null;
  rootMargin = '';
  thresholds = [];
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() { return []; }
}
window.IntersectionObserver = IntersectionObserver as any;

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// Mock document.execCommand (deprecated but still used by some editors)
document.execCommand = jest.fn(() => true);

// Mock Range and Selection APIs
(window as any).Range = class Range {
  commonAncestorContainer = document.body;
  startContainer = document.body;
  endContainer = document.body;
  startOffset = 0;
  endOffset = 0;
  setStart() {}
  setEnd() {}
  collapse() {}
  selectNode() {}
  selectNodeContents() {}
  compareBoundaryPoints() { return 0; }
  deleteContents() {}
  extractContents() { return document.createDocumentFragment(); }
  cloneContents() { return document.createDocumentFragment(); }
  insertNode() {}
  surroundContents() {}
  cloneRange() { return this; }
  detach() {}
  toString() { return ''; }
  createContextualFragment() { return document.createDocumentFragment(); }
};
