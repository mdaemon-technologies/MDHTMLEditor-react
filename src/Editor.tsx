/**
 * MDHTMLEditor React Component
 * A TinyMCE-compatible React wrapper for MDHTMLEditor
 */

import {
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
} from 'react';
import {
  HTMLEditor,
  EditorConfig,
  setTranslate,
  setGetFileSrc,
} from '@mdaemon/html-editor';

export interface EditorProps {
  /**
   * Editor configuration - TinyMCE compatible
   */
  config: EditorConfig;
  
  /**
   * Initial HTML content (also known as 'body' for TinyMCE compat)
   */
  body?: string;
  
  /**
   * Initial HTML content (alias for body)
   */
  initialValue?: string;
  
  /**
   * Name attribute for the hidden textarea
   */
  name?: string;
  
  /**
   * Called when content is modified
   */
  onDirty?: (dirty: boolean) => void;
  
  /**
   * Called on content change (debounced)
   */
  onChange?: (content: string) => void;
  
  /**
   * Called when editor is fully initialized
   */
  onInit?: (editor: HTMLEditor) => void;
  
  /**
   * Called when editor receives focus
   */
  onFocus?: () => void;
  
  /**
   * Called when editor loses focus
   */
  onBlur?: () => void;
  
  /**
   * Translation function
   */
  translate?: (key: string) => string;
  
  /**
   * Function to resolve file paths (like TinyMCE's tinymceScriptSrc path)
   */
  getFileSrc?: (path: string) => string;
  
  /**
   * Disable the editor
   */
  disabled?: boolean;
}

export interface EditorRef {
  /**
   * Get the underlying HTMLEditor instance
   */
  getEditor: () => HTMLEditor | null;
  
  /**
   * Get the editor content as HTML
   */
  getContent: () => string;
  
  /**
   * Set the editor content
   */
  setContent: (html: string) => void;
  
  /**
   * Insert content at cursor position
   */
  insertContent: (html: string) => void;
  
  /**
   * Focus the editor
   */
  focus: () => void;
}

// Global editor instance for single-editor APIs
let globalEditor: HTMLEditor | null = null;

/**
 * Get content from the global editor instance
 * Note: Only works with single editor on the page
 */
export function getEditorContent(): string {
  return globalEditor?.getContent() ?? '';
}

/**
 * Set content on the global editor instance
 * Note: Only works with single editor on the page
 */
export function setEditorContent(html: string): void {
  globalEditor?.setContent(html);
}

/**
 * MDHTMLEditor React Component
 */
export const Editor = forwardRef<EditorRef, EditorProps>(function Editor(
  props,
  ref
) {
  const {
    config,
    body,
    initialValue,
    name,
    onDirty,
    onChange,
    onInit,
    onFocus,
    onBlur,
    translate,
    getFileSrc,
    disabled,
  } = props;
  
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLEditor | null>(null);
  const [ready, setReady] = useState(false);
  
  // Set global translation function if provided
  useEffect(() => {
    if (translate) {
      setTranslate(translate);
    }
  }, [translate]);
  
  // Set global file source resolver if provided
  useEffect(() => {
    if (getFileSrc) {
      setGetFileSrc(getFileSrc);
    }
  }, [getFileSrc]);
  
  // Initialize editor
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Create the editor
    const editor = new HTMLEditor(containerRef.current, {
      ...config,
      // Pass setup through to allow custom buttons
      setup: (ed) => {
        config.setup?.(ed);
      },
    });
    
    editorRef.current = editor;
    globalEditor = editor;
    
    // Set initial content
    const content = body ?? initialValue ?? '';
    if (content) {
      editor.setContent(content);
    }
    
    // Bind events
    editor.on('init', () => {
      setReady(true);
      onInit?.(editor);
    });
    
    editor.on('dirty', (dirty) => {
      onDirty?.(dirty);
    });
    
    editor.on('change', (content) => {
      onChange?.(content);
      editor.setDirty(false);
    });
    
    editor.on('focus', () => {
      onFocus?.();
    });
    
    editor.on('blur', () => {
      onBlur?.();
    });
    
    // Cleanup
    return () => {
      editor.destroy();
      editorRef.current = null;
      if (globalEditor === editor) {
        globalEditor = null;
      }
    };
  }, []); // Only run once on mount
  
  // Update disabled state
  useEffect(() => {
    // Note: TipTap has setEditable() but our wrapper would need to expose it
    // For now, we apply a visual disabled state
    if (containerRef.current) {
      containerRef.current.style.pointerEvents = disabled ? 'none' : '';
      containerRef.current.style.opacity = disabled ? '0.6' : '';
    }
  }, [disabled]);
  
  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    getEditor: () => editorRef.current,
    getContent: () => editorRef.current?.getContent() ?? '',
    setContent: (html: string) => editorRef.current?.setContent(html),
    insertContent: (html: string) => editorRef.current?.insertContent(html),
    focus: () => editorRef.current?.focus(),
  }), []);
  
  return (
    <div className="md-editor-react-wrapper">
      <div ref={containerRef} className="md-editor-container" />
      {/* Hidden textarea for form submission */}
      {name && ready && (
        <input
          type="hidden"
          name={name}
          value={editorRef.current?.getContent() ?? ''}
        />
      )}
    </div>
  );
});

Editor.displayName = 'MDHTMLEditor';

export default Editor;
