/**
 * Editor Component Tests
 */

import React, { createRef } from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { Editor, EditorRef, getEditorContent, setEditorContent } from '../src/Editor';
import { HTMLEditor, setTranslate, setGetFileSrc } from '@mdaemon/html-editor';

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
  };
});

describe('Editor Component', () => {
  let mockEditorInstance: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockEditorInstance = (HTMLEditor as any).mockInstance;
    // Reset the on implementation for each test
    mockEditorInstance.on.mockImplementation((event: string, callback: Function) => {
      if (event === 'init') {
        // Simulate async initialization
        setTimeout(() => callback(), 0);
      }
    });
  });

  describe('Basic Rendering', () => {
    it('renders without crashing', () => {
      render(<Editor config={{}} />);
      expect(document.querySelector('.md-editor-react-wrapper')).toBeInTheDocument();
    });

    it('renders container div', () => {
      render(<Editor config={{}} />);
      expect(document.querySelector('.md-editor-container')).toBeInTheDocument();
    });

    it('creates HTMLEditor with container element', () => {
      render(<Editor config={{}} />);
      expect(HTMLEditor).toHaveBeenCalledTimes(1);
      expect(HTMLEditor).toHaveBeenCalledWith(
        expect.any(HTMLDivElement),
        expect.objectContaining({ setup: expect.any(Function) })
      );
    });

    it('has correct displayName', () => {
      expect(Editor.displayName).toBe('MDHTMLEditor');
    });
  });

  describe('Initial Content', () => {
    it('sets initial content from body prop', () => {
      render(<Editor config={{}} body="<p>Body content</p>" />);
      expect(mockEditorInstance.setContent).toHaveBeenCalledWith('<p>Body content</p>');
    });

    it('sets initial content from initialValue prop', () => {
      render(<Editor config={{}} initialValue="<p>Initial value</p>" />);
      expect(mockEditorInstance.setContent).toHaveBeenCalledWith('<p>Initial value</p>');
    });

    it('prefers body over initialValue when both provided', () => {
      render(<Editor config={{}} body="<p>Body</p>" initialValue="<p>Initial</p>" />);
      expect(mockEditorInstance.setContent).toHaveBeenCalledWith('<p>Body</p>');
    });

    it('does not call setContent when no initial content provided', () => {
      render(<Editor config={{}} />);
      expect(mockEditorInstance.setContent).not.toHaveBeenCalled();
    });
  });

  describe('Configuration', () => {
    it('passes config to HTMLEditor', () => {
      const config = { toolbar: ['bold', 'italic'] };
      render(<Editor config={config} />);
      
      expect(HTMLEditor).toHaveBeenCalledWith(
        expect.any(HTMLDivElement),
        expect.objectContaining({ toolbar: ['bold', 'italic'] })
      );
    });

    it('calls config.setup function', () => {
      const setupMock = jest.fn();
      const config = { setup: setupMock };
      render(<Editor config={config} />);
      
      // Get the setup function that was passed
      const passedConfig = (HTMLEditor as jest.Mock).mock.calls[0][1];
      // Call the setup function to verify it chains
      passedConfig.setup({});
      expect(setupMock).toHaveBeenCalled();
    });
  });

  describe('Event Callbacks', () => {
    it('calls onInit when editor initializes', async () => {
      const onInit = jest.fn();
      
      render(<Editor config={{}} onInit={onInit} />);
      
      // Find the init callback and trigger it
      const initCallback = mockEditorInstance.on.mock.calls.find(
        (call: any[]) => call[0] === 'init'
      )?.[1];
      
      await act(async () => {
        initCallback?.();
      });
      
      expect(onInit).toHaveBeenCalledWith(mockEditorInstance);
    });

    it('calls onDirty when editor becomes dirty', () => {
      const onDirty = jest.fn();
      render(<Editor config={{}} onDirty={onDirty} />);
      
      const dirtyCallback = mockEditorInstance.on.mock.calls.find(
        (call: any[]) => call[0] === 'dirty'
      )?.[1];
      
      dirtyCallback?.(true);
      expect(onDirty).toHaveBeenCalledWith(true);
      
      dirtyCallback?.(false);
      expect(onDirty).toHaveBeenCalledWith(false);
    });

    it('calls onChange when content changes', () => {
      const onChange = jest.fn();
      render(<Editor config={{}} onChange={onChange} />);
      
      const changeCallback = mockEditorInstance.on.mock.calls.find(
        (call: any[]) => call[0] === 'change'
      )?.[1];
      
      changeCallback?.('<p>New content</p>');
      expect(onChange).toHaveBeenCalledWith('<p>New content</p>');
    });

    it('resets dirty state after onChange', () => {
      const onChange = jest.fn();
      render(<Editor config={{}} onChange={onChange} />);
      
      const changeCallback = mockEditorInstance.on.mock.calls.find(
        (call: any[]) => call[0] === 'change'
      )?.[1];
      
      changeCallback?.('<p>New content</p>');
      expect(mockEditorInstance.setDirty).toHaveBeenCalledWith(false);
    });

    it('calls onFocus when editor receives focus', () => {
      const onFocus = jest.fn();
      render(<Editor config={{}} onFocus={onFocus} />);
      
      const focusCallback = mockEditorInstance.on.mock.calls.find(
        (call: any[]) => call[0] === 'focus'
      )?.[1];
      
      focusCallback?.();
      expect(onFocus).toHaveBeenCalled();
    });

    it('calls onBlur when editor loses focus', () => {
      const onBlur = jest.fn();
      render(<Editor config={{}} onBlur={onBlur} />);
      
      const blurCallback = mockEditorInstance.on.mock.calls.find(
        (call: any[]) => call[0] === 'blur'
      )?.[1];
      
      blurCallback?.();
      expect(onBlur).toHaveBeenCalled();
    });

    it('registers all event listeners', () => {
      render(<Editor config={{}} />);
      
      const eventNames = mockEditorInstance.on.mock.calls.map((call: any[]) => call[0]);
      expect(eventNames).toContain('init');
      expect(eventNames).toContain('dirty');
      expect(eventNames).toContain('change');
      expect(eventNames).toContain('focus');
      expect(eventNames).toContain('blur');
    });
  });

  describe('Ref Methods', () => {
    it('exposes getEditor method', () => {
      const ref = createRef<EditorRef>();
      render(<Editor config={{}} ref={ref} />);
      
      expect(ref.current?.getEditor()).toBe(mockEditorInstance);
    });

    it('exposes getContent method', () => {
      const ref = createRef<EditorRef>();
      render(<Editor config={{}} ref={ref} />);
      
      const content = ref.current?.getContent();
      expect(mockEditorInstance.getContent).toHaveBeenCalled();
      expect(content).toBe('<p>Test content</p>');
    });

    it('exposes setContent method', () => {
      const ref = createRef<EditorRef>();
      render(<Editor config={{}} ref={ref} />);
      
      ref.current?.setContent('<p>New content</p>');
      expect(mockEditorInstance.setContent).toHaveBeenCalledWith('<p>New content</p>');
    });

    it('exposes insertContent method', () => {
      const ref = createRef<EditorRef>();
      render(<Editor config={{}} ref={ref} />);
      
      ref.current?.insertContent('<span>inserted</span>');
      expect(mockEditorInstance.insertContent).toHaveBeenCalledWith('<span>inserted</span>');
    });

    it('exposes focus method', () => {
      const ref = createRef<EditorRef>();
      render(<Editor config={{}} ref={ref} />);
      
      ref.current?.focus();
      expect(mockEditorInstance.focus).toHaveBeenCalled();
    });

    it('returns empty string when editor is null for getContent', () => {
      const ref = createRef<EditorRef>();
      render(<Editor config={{}} ref={ref} />);
      
      // Simulate editor not initialized
      mockEditorInstance.getContent.mockReturnValueOnce(undefined);
      const content = ref.current?.getContent();
      expect(content).toBe('');
    });
  });

  describe('Translation and File Source', () => {
    it('sets translate function when provided', () => {
      const translate = (key: string) => `translated:${key}`;
      render(<Editor config={{}} translate={translate} />);
      
      expect(setTranslate).toHaveBeenCalledWith(translate);
    });

    it('sets getFileSrc function when provided', () => {
      const getFileSrc = (path: string) => `/assets/${path}`;
      render(<Editor config={{}} getFileSrc={getFileSrc} />);
      
      expect(setGetFileSrc).toHaveBeenCalledWith(getFileSrc);
    });

    it('does not call setTranslate when not provided', () => {
      render(<Editor config={{}} />);
      expect(setTranslate).not.toHaveBeenCalled();
    });

    it('does not call setGetFileSrc when not provided', () => {
      render(<Editor config={{}} />);
      expect(setGetFileSrc).not.toHaveBeenCalled();
    });
  });

  describe('Disabled State', () => {
    it('applies disabled styling when disabled prop is true', () => {
      render(<Editor config={{}} disabled={true} />);
      
      const container = document.querySelector('.md-editor-container') as HTMLElement;
      expect(container.style.pointerEvents).toBe('none');
      expect(container.style.opacity).toBe('0.6');
    });

    it('removes disabled styling when disabled prop is false', () => {
      const { rerender } = render(<Editor config={{}} disabled={true} />);
      
      rerender(<Editor config={{}} disabled={false} />);
      
      const container = document.querySelector('.md-editor-container') as HTMLElement;
      expect(container.style.pointerEvents).toBe('');
      expect(container.style.opacity).toBe('');
    });

    it('toggles disabled state on prop change', () => {
      const { rerender } = render(<Editor config={{}} disabled={false} />);
      
      const container = document.querySelector('.md-editor-container') as HTMLElement;
      expect(container.style.pointerEvents).toBe('');
      
      rerender(<Editor config={{}} disabled={true} />);
      expect(container.style.pointerEvents).toBe('none');
      
      rerender(<Editor config={{}} disabled={false} />);
      expect(container.style.pointerEvents).toBe('');
    });
  });

  describe('Hidden Input for Forms', () => {
    it('renders hidden input with name when ready', async () => {
      mockEditorInstance.on.mockImplementation((event: string, callback: Function) => {
        if (event === 'init') {
          callback();
        }
      });
      
      render(<Editor config={{}} name="content" />);
      
      await waitFor(() => {
        const input = document.querySelector('input[type="hidden"]');
        expect(input).toBeInTheDocument();
        expect(input).toHaveAttribute('name', 'content');
      });
    });

    it('does not render hidden input without name', () => {
      render(<Editor config={{}} />);
      
      const input = document.querySelector('input[type="hidden"]');
      expect(input).not.toBeInTheDocument();
    });

    it('hidden input value reflects editor content', async () => {
      mockEditorInstance.on.mockImplementation((event: string, callback: Function) => {
        if (event === 'init') {
          callback();
        }
      });
      
      render(<Editor config={{}} name="content" />);
      
      await waitFor(() => {
        const input = document.querySelector('input[type="hidden"]') as HTMLInputElement;
        expect(input.value).toBe('<p>Test content</p>');
      });
    });
  });

  describe('Cleanup', () => {
    it('destroys editor on unmount', () => {
      const { unmount } = render(<Editor config={{}} />);
      
      unmount();
      
      expect(mockEditorInstance.destroy).toHaveBeenCalled();
    });

    it('clears global editor reference on unmount', () => {
      const { unmount } = render(<Editor config={{}} />);
      
      // Editor should be set initially
      expect(getEditorContent()).toBeDefined();
      
      unmount();
      
      // After unmount, global methods should return empty
      expect(getEditorContent()).toBe('');
    });
  });
});

describe('Global Editor Functions', () => {
  let mockEditorInstance: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockEditorInstance = (HTMLEditor as any).mockInstance;
    mockEditorInstance.on.mockImplementation((event: string, callback: Function) => {
      if (event === 'init') {
        setTimeout(() => callback(), 0);
      }
    });
  });

  it('getEditorContent returns content from global editor', () => {
    render(<Editor config={{}} />);
    
    const content = getEditorContent();
    expect(content).toBe('<p>Test content</p>');
  });

  it('setEditorContent sets content on global editor', () => {
    render(<Editor config={{}} />);
    
    setEditorContent('<p>New global content</p>');
    expect(mockEditorInstance.setContent).toHaveBeenCalledWith('<p>New global content</p>');
  });

  it('getEditorContent returns empty string when no editor', () => {
    // Don't render any editor
    const content = getEditorContent();
    expect(content).toBe('');
  });
});
