/**
 * useEditor Hook
 * Custom hook for advanced editor usage
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { HTMLEditor, EditorConfig } from '@mdaemon/html-editor';

export interface UseEditorOptions {
  config?: EditorConfig;
  content?: string;
  onUpdate?: (html: string) => void;
}

export interface UseEditorReturn {
  /**
   * The editor instance
   */
  editor: HTMLEditor | null;
  
  /**
   * Ref to attach to the container element
   */
  containerRef: React.RefObject<HTMLDivElement | null>;
  
  /**
   * Whether the editor is ready
   */
  ready: boolean;
  
  /**
   * Get the current HTML content
   */
  getContent: () => string;
  
  /**
   * Set the HTML content
   */
  setContent: (html: string) => void;
  
  /**
   * Insert HTML at cursor
   */
  insertContent: (html: string) => void;
  
  /**
   * Focus the editor
   */
  focus: () => void;
  
  /**
   * Check if editor is dirty
   */
  isDirty: () => boolean;
}

/**
 * Hook for programmatic editor control
 */
export function useEditor(options: UseEditorOptions = {}): UseEditorReturn {
  const { config = {}, content = '', onUpdate } = options;
  
  const containerRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<HTMLEditor | null>(null);
  const [ready, setReady] = useState(false);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    const editor = new HTMLEditor(containerRef.current, config);
    editorRef.current = editor;
    
    if (content) {
      editor.setContent(content);
    }
    
    editor.on('init', () => {
      setReady(true);
    });
    
    if (onUpdate) {
      editor.on('change', onUpdate);
    }
    
    return () => {
      editor.destroy();
      editorRef.current = null;
      setReady(false);
    };
  }, []); // Only mount once
  
  const getContent = useCallback(() => {
    return editorRef.current?.getContent() ?? '';
  }, []);
  
  const setContent = useCallback((html: string) => {
    editorRef.current?.setContent(html);
  }, []);
  
  const insertContent = useCallback((html: string) => {
    editorRef.current?.insertContent(html);
  }, []);
  
  const focus = useCallback(() => {
    editorRef.current?.focus();
  }, []);
  
  const isDirty = useCallback(() => {
    return editorRef.current?.isDirty() ?? false;
  }, []);
  
  return {
    editor: editorRef.current,
    containerRef,
    ready,
    getContent,
    setContent,
    insertContent,
    focus,
    isDirty,
  };
}
