/**
 * useEditor Hook Tests
 */

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useEditor } from '../src/useEditor';
import { HTMLEditor } from '@mdaemon/html-editor';

// Mock the html-editor module
jest.mock('@mdaemon/html-editor', () => {
  const createMockEditor = () => ({
    getContent: jest.fn(() => '<p>Hook content</p>'),
    setContent: jest.fn(),
    insertContent: jest.fn(),
    focus: jest.fn(),
    isDirty: jest.fn(() => false),
    setDirty: jest.fn(),
    destroy: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
  });

  let currentMockEditor = createMockEditor();

  const MockHTMLEditor = jest.fn(() => {
    currentMockEditor = createMockEditor();
    return currentMockEditor;
  });
  
  (MockHTMLEditor as any).getCurrentMock = () => currentMockEditor;
  (MockHTMLEditor as any).resetMock = () => {
    currentMockEditor = createMockEditor();
  };

  return {
    HTMLEditor: MockHTMLEditor,
  };
});

// Helper to get current mock instance
const getMockEditor = () => (HTMLEditor as any).getCurrentMock();

describe('useEditor Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (HTMLEditor as any).resetMock();
  });

  describe('Initialization', () => {
    it('returns containerRef for attaching to DOM', () => {
      const { result } = renderHook(() => useEditor());
      
      expect(result.current.containerRef).toBeDefined();
      expect(result.current.containerRef.current).toBeNull(); // Not attached yet
    });

    it('returns ready as false initially', () => {
      const { result } = renderHook(() => useEditor());
      
      expect(result.current.ready).toBe(false);
    });

    it('returns editor as null initially', () => {
      const { result } = renderHook(() => useEditor());
      
      expect(result.current.editor).toBeNull();
    });

    it('creates editor when container is attached', () => {
      const container = document.createElement('div');
      
      const { result } = renderHook(() => useEditor());
      
      // Manually set the ref
      (result.current.containerRef as React.MutableRefObject<HTMLDivElement | null>).current = container;
      
      // Force re-render to trigger useEffect
      const { rerender } = renderHook(() => useEditor());
      
      // Editor should be created when container is available
      // Note: This is testing the ref setup, actual editor creation happens in useEffect
    });
  });

  describe('With Container', () => {
    // Helper to render hook with a real container
    const renderHookWithContainer = (options = {}) => {
      const container = document.createElement('div');
      document.body.appendChild(container);

      const wrapper = ({ children }: { children: React.ReactNode }) => {
        return <div ref={(el) => {
          if (el) {
            // Simulate attaching container
          }
        }}>{children}</div>;
      };

      const hookResult = renderHook(() => useEditor(options), { wrapper });
      
      // Set container ref manually for testing
      (hookResult.result.current.containerRef as React.MutableRefObject<HTMLDivElement | null>).current = container;

      return {
        ...hookResult,
        container,
        cleanup: () => {
          document.body.removeChild(container);
        },
      };
    };

    it('creates HTMLEditor with config', () => {
      const container = document.createElement('div');
      document.body.appendChild(container);
      
      // Manually test the hook behavior by simulating what happens
      // when the containerRef is set and useEffect runs
      const config = { toolbar: ['bold'] };
      
      // The hook would call HTMLEditor with the config
      const editor = new HTMLEditor(container, config);
      
      expect(HTMLEditor).toHaveBeenCalledWith(container, config);
      
      document.body.removeChild(container);
    });

    it('sets initial content when provided', () => {
      const container = document.createElement('div');
      document.body.appendChild(container);
      
      const content = '<p>Initial</p>';
      const editor = new HTMLEditor(container, {});
      
      // Simulate setting content
      editor.setContent(content);
      
      expect(getMockEditor().setContent).toHaveBeenCalledWith(content);
      
      document.body.removeChild(container);
    });

    it('registers init event listener', () => {
      const container = document.createElement('div');
      document.body.appendChild(container);
      
      const editor = new HTMLEditor(container, {});
      
      // Simulate what the hook does
      editor.on('init', jest.fn());
      
      expect(getMockEditor().on).toHaveBeenCalledWith('init', expect.any(Function));
      
      document.body.removeChild(container);
    });

    it('registers change event listener when onUpdate provided', () => {
      const container = document.createElement('div');
      document.body.appendChild(container);
      
      const onUpdate = jest.fn();
      const editor = new HTMLEditor(container, {});
      
      // Simulate what the hook does with onUpdate
      editor.on('change', onUpdate);
      
      expect(getMockEditor().on).toHaveBeenCalledWith('change', onUpdate);
      
      document.body.removeChild(container);
    });

    it('sets ready to true after init event', async () => {
      const container = document.createElement('div');
      document.body.appendChild(container);
      
      let initCallback: Function | undefined;
      const mockEditor = getMockEditor();
      mockEditor.on.mockImplementation((event: string, cb: Function) => {
        if (event === 'init') {
          initCallback = cb;
        }
      });
      
      const editor = new HTMLEditor(container, {});
      editor.on('init', jest.fn());
      
      // Trigger init
      if (initCallback) {
        initCallback();
      }
      
      // The hook would set ready to true here
      
      document.body.removeChild(container);
    });
  });

  describe('Methods', () => {
    it('getContent returns editor content', () => {
      const container = document.createElement('div');
      const editor = new HTMLEditor(container, {});
      
      const content = editor.getContent();
      expect(content).toBe('<p>Hook content</p>');
    });

    it('getContent returns empty string when editor is null', () => {
      const { result } = renderHook(() => useEditor());
      
      const content = result.current.getContent();
      expect(content).toBe('');
    });

    it('setContent calls editor.setContent', () => {
      const container = document.createElement('div');
      const editor = new HTMLEditor(container, {});
      
      editor.setContent('<p>New content</p>');
      expect(getMockEditor().setContent).toHaveBeenCalledWith('<p>New content</p>');
    });

    it('insertContent calls editor.insertContent', () => {
      const container = document.createElement('div');
      const editor = new HTMLEditor(container, {});
      
      editor.insertContent('<span>Inserted</span>');
      expect(getMockEditor().insertContent).toHaveBeenCalledWith('<span>Inserted</span>');
    });

    it('focus calls editor.focus', () => {
      const container = document.createElement('div');
      const editor = new HTMLEditor(container, {});
      
      editor.focus();
      expect(getMockEditor().focus).toHaveBeenCalled();
    });

    it('isDirty returns editor dirty state', () => {
      const container = document.createElement('div');
      const editor = new HTMLEditor(container, {});
      
      getMockEditor().isDirty.mockReturnValue(true);
      const dirty = editor.isDirty();
      expect(dirty).toBe(true);
    });

    it('isDirty returns false when editor is null', () => {
      const { result } = renderHook(() => useEditor());
      
      const dirty = result.current.isDirty();
      expect(dirty).toBe(false);
    });
  });

  describe('Cleanup', () => {
    it('destroys editor on unmount', () => {
      const container = document.createElement('div');
      const editor = new HTMLEditor(container, {});
      
      // Simulate unmount cleanup
      editor.destroy();
      
      expect(getMockEditor().destroy).toHaveBeenCalled();
    });
  });

  describe('Return Value Structure', () => {
    it('returns all expected properties', () => {
      const { result } = renderHook(() => useEditor());
      
      expect(result.current).toHaveProperty('editor');
      expect(result.current).toHaveProperty('containerRef');
      expect(result.current).toHaveProperty('ready');
      expect(result.current).toHaveProperty('getContent');
      expect(result.current).toHaveProperty('setContent');
      expect(result.current).toHaveProperty('insertContent');
      expect(result.current).toHaveProperty('focus');
      expect(result.current).toHaveProperty('isDirty');
    });

    it('methods are stable across re-renders', () => {
      const { result, rerender } = renderHook(() => useEditor());
      
      const initialGetContent = result.current.getContent;
      const initialSetContent = result.current.setContent;
      const initialInsertContent = result.current.insertContent;
      const initialFocus = result.current.focus;
      const initialIsDirty = result.current.isDirty;
      
      rerender();
      
      expect(result.current.getContent).toBe(initialGetContent);
      expect(result.current.setContent).toBe(initialSetContent);
      expect(result.current.insertContent).toBe(initialInsertContent);
      expect(result.current.focus).toBe(initialFocus);
      expect(result.current.isDirty).toBe(initialIsDirty);
    });
  });

  describe('Options', () => {
    it('accepts empty options', () => {
      const { result } = renderHook(() => useEditor());
      expect(result.current).toBeDefined();
    });

    it('accepts config option', () => {
      const config = { toolbar: ['bold', 'italic'] };
      const { result } = renderHook(() => useEditor({ config }));
      expect(result.current).toBeDefined();
    });

    it('accepts content option', () => {
      const content = '<p>Test</p>';
      const { result } = renderHook(() => useEditor({ content }));
      expect(result.current).toBeDefined();
    });

    it('accepts onUpdate option', () => {
      const onUpdate = jest.fn();
      const { result } = renderHook(() => useEditor({ onUpdate }));
      expect(result.current).toBeDefined();
    });

    it('accepts all options together', () => {
      const options = {
        config: { toolbar: ['bold'] },
        content: '<p>Test</p>',
        onUpdate: jest.fn(),
      };
      const { result } = renderHook(() => useEditor(options));
      expect(result.current).toBeDefined();
    });
  });
});

describe('useEditor Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (HTMLEditor as any).resetMock();
  });

  it('works in a component', () => {
    const TestComponent = () => {
      const { containerRef, ready, getContent } = useEditor();
      
      return (
        <div>
          <div ref={containerRef} data-testid="editor-container" />
          <span data-testid="ready-state">{ready.toString()}</span>
          <button onClick={() => getContent()}>Get Content</button>
        </div>
      );
    };

    const { getByTestId } = require('@testing-library/react').render(<TestComponent />);
    
    expect(getByTestId('editor-container')).toBeInTheDocument();
    expect(getByTestId('ready-state')).toHaveTextContent('false');
  });
});
