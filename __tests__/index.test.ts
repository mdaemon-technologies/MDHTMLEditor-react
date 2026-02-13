/**
 * Index Module Export Tests
 */

// Mock the html-editor module
jest.mock('@mdaemon/html-editor', () => {
  const mockEditor = {
    getContent: jest.fn(() => '<p>Test content</p>'),
    setContent: jest.fn(),
    insertContent: jest.fn(),
    focus: jest.fn(),
    isDirty: jest.fn(() => false),
    setDirty: jest.fn(),
    destroy: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
  };

  const MockHTMLEditor = jest.fn(() => mockEditor);
  (MockHTMLEditor as any).mockInstance = mockEditor;

  return {
    HTMLEditor: MockHTMLEditor,
    setTranslate: jest.fn(),
    setGetFileSrc: jest.fn(),
    fontNames: ['Arial', 'Times New Roman'],
  };
});

// Test that all exports are available from the main entry point
describe('Module Exports', () => {
  // We need to test that the module exports what it claims to export
  // Since we're mocking the html-editor module, we test the structure

  describe('React Component Exports', () => {
    it('exports Editor component', async () => {
      const module = await import('../src/index');
      expect(module.Editor).toBeDefined();
      expect(typeof module.Editor).toBe('object'); // forwardRef returns object
    });

    it('exports MDEditor as alias for Editor', async () => {
      const module = await import('../src/index');
      expect(module.MDEditor).toBeDefined();
      expect(module.MDEditor).toBe(module.Editor);
    });

    it('exports getEditorContent function', async () => {
      const module = await import('../src/index');
      expect(module.getEditorContent).toBeDefined();
      expect(typeof module.getEditorContent).toBe('function');
    });

    it('exports setEditorContent function', async () => {
      const module = await import('../src/index');
      expect(module.setEditorContent).toBeDefined();
      expect(typeof module.setEditorContent).toBe('function');
    });
  });

  describe('Hook Exports', () => {
    it('exports useEditor hook', async () => {
      const module = await import('../src/index');
      expect(module.useEditor).toBeDefined();
      expect(typeof module.useEditor).toBe('function');
    });
  });

  describe('Re-exported Utilities', () => {
    it('exports fontNames', async () => {
      const module = await import('../src/index');
      expect(module.fontNames).toBeDefined();
    });

    it('exports setTranslate function', async () => {
      const module = await import('../src/index');
      expect(module.setTranslate).toBeDefined();
      expect(typeof module.setTranslate).toBe('function');
    });

    it('exports setGetFileSrc function', async () => {
      const module = await import('../src/index');
      expect(module.setGetFileSrc).toBeDefined();
      expect(typeof module.setGetFileSrc).toBe('function');
    });
  });
});

describe('Type Exports', () => {
  // TypeScript type exports can't be tested at runtime,
  // but we can verify the module structure is correct

  it('module exports expected named exports', async () => {
    const module = await import('../src/index');
    
    const expectedExports = [
      'Editor',
      'MDEditor',
      'getEditorContent',
      'setEditorContent',
      'useEditor',
      'fontNames',
      'setTranslate',
      'setGetFileSrc',
    ];

    expectedExports.forEach((exportName) => {
      expect(module).toHaveProperty(exportName);
    });
  });
});
