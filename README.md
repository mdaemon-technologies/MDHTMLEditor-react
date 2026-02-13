# MDHTMLEditor React

React wrapper for MDHTMLEditor, providing a TinyMCE-compatible React component.

## Installation

```bash
npm install @mdaemon/html-editor-react
```

Note: This package requires `@mdaemon/html-editor` as a peer dependency.

## Usage

### Basic Usage

```tsx
import React, { useRef } from 'react';
import { MDEditor, EditorRef } from '@mdaemon/html-editor-react';

function MyComponent() {
  const editorRef = useRef<EditorRef>(null);

  const handleInit = (editor) => {
    console.log('Editor ready:', editor);
  };

  const handleChange = (content) => {
    console.log('Content changed:', content);
  };

  return (
    <MDEditor
      ref={editorRef}
      init={{
        height: 400,
        basicEditor: false,
      }}
      initialValue="<p>Hello World</p>"
      onInit={handleInit}
      onEditorChange={handleChange}
    />
  );
}
```

### useEditor Hook

For more control, use the `useEditor` hook:

```tsx
import { useEditor } from '@mdaemon/html-editor-react';

function MyComponent() {
  const { containerRef, editor, content, setContent, isDirty } = useEditor({
    initialValue: '<p>Hello</p>',
    onChange: (html) => console.log('Changed:', html),
  });

  const handleSave = () => {
    if (isDirty) {
      saveContent(content);
      editor?.setDirty(false);
    }
  };

  return (
    <div>
      <div ref={containerRef} />
      <button onClick={handleSave}>Save</button>
    </div>
  );
}
```

### Global Access

For legacy compatibility, editors can be accessed globally:

```tsx
import { getEditorContent, setEditorContent } from '@mdaemon/html-editor-react';

// Get content from any editor by ID
const content = getEditorContent('myEditor');

// Set content
setEditorContent('myEditor', '<p>New content</p>');
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `id` | string | Editor identifier for global access |
| `init` | EditorConfig | Configuration object passed to HTMLEditor |
| `initialValue` | string | Initial HTML content |
| `value` | string | Controlled content value |
| `disabled` | boolean | Disable editing |
| `onInit` | (editor) => void | Called when editor initializes |
| `onEditorChange` | (content) => void | Called on content change |
| `onDirtyChange` | (isDirty) => void | Called when dirty state changes |
| `onFocus` | () => void | Called on focus |
| `onBlur` | () => void | Called on blur |

## EditorRef Methods

When using the `ref` prop, you have access to:

- `getContent(): string` - Get current HTML
- `setContent(html: string): void` - Set HTML content
- `insertContent(html: string): void` - Insert at cursor
- `execCommand(cmd, ui?, value?): boolean` - Run command
- `focus(): void` - Focus editor
- `isDirty(): boolean` - Check dirty state
- `setDirty(state): void` - Set dirty state

## Configuration

All configuration options from `@mdaemon/html-editor` are supported in the `init` prop:

```tsx
<MDEditor
  init={{
    basicEditor: false,
    includeTemplates: true,
    templates: [
      { title: 'Signature', content: '<p>Best regards,<br/>John</p>' }
    ],
    dropbox: true,
    images_upload_url: '/api/upload',
    font_family_formats: 'Arial=arial;Times=times new roman',
    font_size_formats: '10pt 12pt 14pt 16pt',
    fontName: 'Arial',
    fontSize: '12pt',
    directionality: 'ltr',
    skin: 'oxide',
    height: 400,
  }}
/>
```

## Migration from @tinymce/tinymce-react

This package provides a similar API to `@tinymce/tinymce-react`:

```tsx
// Before (TinyMCE)
import { Editor } from '@tinymce/tinymce-react';

<Editor
  init={{ height: 400, plugins: 'link image' }}
  onEditorChange={handleChange}
/>

// After (MDHTMLEditor)
import { MDEditor } from '@mdaemon/html-editor-react';

<MDEditor
  init={{ height: 400 }}
  onEditorChange={handleChange}
/>
```

Key differences:
- No `licenseKey` or `apiKey` required
- `plugins` option not needed (features built-in)
- Toolbar customization uses `basicEditor` boolean instead of `toolbar` string

## License

LGPL 3.0 or later - MDaemon Technologies
