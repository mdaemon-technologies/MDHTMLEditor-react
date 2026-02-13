/**
 * MDHTMLEditor React - Main Entry Point
 */

// React components
export { Editor as MDEditor, Editor, getEditorContent, setEditorContent } from './Editor';
export type { EditorProps, EditorRef } from './Editor';

// Hooks
export { useEditor } from './useEditor';
export type { UseEditorOptions, UseEditorReturn } from './useEditor';

// Re-export core types and utilities
export {
  fontNames,
  setTranslate,
  setGetFileSrc,
} from '@mdaemon/html-editor';

export type {
  EditorConfig,
  EditorEvents,
  Template,
  ToolbarButtonSpec,
  ToolbarButtonAPI,
} from '@mdaemon/html-editor';
