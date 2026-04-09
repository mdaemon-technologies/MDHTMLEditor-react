# MDHTMLEditor React

A React wrapper for [MDHTMLEditor](https://github.com/mdaemon-technologies/MDHTMLEditor) &mdash; a WYSIWYG HTML editor built on TipTap. Provides a drop-in replacement for `@tinymce/tinymce-react` with no license key required.

## Installation

```bash
npm install @mdaemon/html-editor-react @mdaemon/html-editor
```

**Peer dependencies:** `react` and `react-dom` (v18 or v19).

## Styles

You must import the editor stylesheet for the toolbar and UI to render correctly:

```tsx
import '@mdaemon/html-editor/dist/styles.css';
```

## Quick Start

```tsx
import { useRef } from 'react';
import { Editor } from '@mdaemon/html-editor-react';
import type { EditorRef } from '@mdaemon/html-editor-react';
import '@mdaemon/html-editor/dist/styles.css';

function App() {
  const editorRef = useRef<EditorRef>(null);

  return (
    <Editor
      ref={editorRef}
      config={{ height: 400 }}
      initialValue="<p>Hello World</p>"
      onChange={(html) => console.log('Content:', html)}
      onInit={(editor) => console.log('Ready!', editor)}
    />
  );
}
```

## `<Editor>` Component

The primary way to use the editor. It accepts a `config` object and event callbacks, and exposes imperative methods via a ref.

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `config` | `EditorConfig` | Yes | Configuration object passed to the underlying HTMLEditor. See [Configuration](#configuration). |
| `body` | `string` | No | Initial HTML content. Takes precedence over `initialValue`. |
| `initialValue` | `string` | No | Initial HTML content (alias for `body`). |
| `name` | `string` | No | When set, renders a hidden `<input>` with this name containing the editor content &mdash; useful for form submission. |
| `disabled` | `boolean` | No | Visually disables the editor (pointer-events off, reduced opacity). |
| `onChange` | `(content: string) => void` | No | Called when content changes (debounced). |
| `onDirty` | `(dirty: boolean) => void` | No | Called when the dirty state changes. |
| `onInit` | `(editor: HTMLEditor) => void` | No | Called when the editor finishes initialization. Receives the editor instance. |
| `onFocus` | `() => void` | No | Called when the editor receives focus. |
| `onBlur` | `() => void` | No | Called when the editor loses focus. |
| `translate` | `(key: string) => string` | No | Sets a global translation function for all editors on the page. |
| `getFileSrc` | `(path: string) => string` | No | Sets a global file path resolver (e.g., for CDN prefixing). |

### Ref Methods (`EditorRef`)

Attach a ref to access imperative methods:

```tsx
const editorRef = useRef<EditorRef>(null);

// Later...
const html = editorRef.current?.getContent();
editorRef.current?.setContent('<p>New content</p>');
editorRef.current?.insertContent('<p>Inserted at cursor</p>');
editorRef.current?.focus();

// Access the underlying HTMLEditor instance directly
const rawEditor = editorRef.current?.getEditor();
```

| Method | Signature | Description |
|--------|-----------|-------------|
| `getEditor` | `() => HTMLEditor \| null` | Access the raw HTMLEditor instance for advanced usage. |
| `getContent` | `() => string` | Get current HTML content. |
| `setContent` | `(html: string) => void` | Replace the editor content. |
| `insertContent` | `(html: string) => void` | Insert HTML at the current cursor position. |
| `focus` | `() => void` | Focus the editor. |

### Full Example

```tsx
import { useRef, useState } from 'react';
import { Editor } from '@mdaemon/html-editor-react';
import type { EditorRef } from '@mdaemon/html-editor-react';
import '@mdaemon/html-editor/dist/styles.css';

function EmailComposer() {
  const editorRef = useRef<EditorRef>(null);
  const [dirty, setDirty] = useState(false);

  const handleSave = () => {
    const content = editorRef.current?.getContent() ?? '';
    console.log('Saving:', content);
  };

  return (
    <div>
      <Editor
        ref={editorRef}
        config={{
          height: 500,
          basicEditor: false,
          skin: 'oxide',
          fontName: 'Arial',
          fontSize: '12pt',
        }}
        initialValue="<p>Dear recipient,</p>"
        onChange={(html) => console.log('Changed:', html)}
        onDirty={(d) => setDirty(d)}
        onInit={() => console.log('Editor ready')}
      />
      <button onClick={handleSave} disabled={!dirty}>
        Save
      </button>
    </div>
  );
}
```

## `useEditor` Hook

For more programmatic control, use the `useEditor` hook. You provide a container element via the returned `containerRef`.

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `config` | `EditorConfig` | `{}` | Editor configuration. |
| `content` | `string` | `''` | Initial HTML content. |
| `onUpdate` | `(html: string) => void` | &mdash; | Called on content change. |

### Return Value

| Property | Type | Description |
|----------|------|-------------|
| `editor` | `HTMLEditor \| null` | The raw editor instance (`null` until initialized). |
| `containerRef` | `RefObject<HTMLDivElement \| null>` | Attach this to your container div. |
| `ready` | `boolean` | `true` once the editor has fired its `init` event. |
| `getContent` | `() => string` | Get current HTML content. |
| `setContent` | `(html: string) => void` | Replace the editor content. |
| `insertContent` | `(html: string) => void` | Insert HTML at the cursor. |
| `focus` | `() => void` | Focus the editor. |
| `isDirty` | `() => boolean` | Check if the editor has unsaved changes. |

### Example

```tsx
import { useState } from 'react';
import { useEditor } from '@mdaemon/html-editor-react';
import '@mdaemon/html-editor/dist/styles.css';

function NotesEditor() {
  const [lastSaved, setLastSaved] = useState('');
  const { containerRef, ready, getContent, setContent, isDirty } = useEditor({
    config: { height: 300, basicEditor: true },
    content: '<p>Start taking notes...</p>',
    onUpdate: (html) => console.log('Updated:', html),
  });

  const handleSave = () => {
    setLastSaved(getContent());
  };

  const handleReset = () => {
    setContent('<p>Start taking notes...</p>');
  };

  return (
    <div>
      <div ref={containerRef} />
      {ready && (
        <div>
          <button onClick={handleSave}>Save</button>
          <button onClick={handleReset}>Reset</button>
          <span>{isDirty() ? 'Unsaved changes' : 'Saved'}</span>
        </div>
      )}
    </div>
  );
}
```

## Global Convenience Functions

For single-editor pages, you can get and set content without a ref:

```tsx
import { getEditorContent, setEditorContent } from '@mdaemon/html-editor-react';

// Get content from the active editor
const html = getEditorContent();

// Set content on the active editor
setEditorContent('<p>New content</p>');
```

> **Note:** These functions operate on the most recently mounted `<Editor>` instance. They are intended for pages with a single editor.

## Configuration

The `config` prop (or `useEditor`'s `config` option) accepts an `EditorConfig` object. All options from `@mdaemon/html-editor` are supported:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `basicEditor` | `boolean` | `false` | Use a simplified toolbar (no images, tables, code blocks). |
| `height` | `string \| number` | `300` | Editor height. |
| `language` | `string` | `'en'` | UI language code. 31 languages built in. |
| `skin` | `'oxide' \| 'oxide-dark'` | `'oxide'` | Toolbar and dialog theme. |
| `content_css` | `'default' \| 'dark'` | `'default'` | Content area theme. |
| `content_style` | `string` | &mdash; | Custom CSS injected into the editing surface. |
| `fontName` | `string` | &mdash; | Default font family. |
| `fontSize` | `string` | &mdash; | Default font size. |
| `font_family_formats` | `string` | *(TinyMCE defaults)* | Semicolon-delimited font list (`Name=family,...`). |
| `font_size_formats` | `string` | `'8pt 9pt 10pt 12pt 14pt 18pt 24pt 36pt'` | Space-delimited size options. |
| `directionality` | `'ltr' \| 'rtl'` | `'ltr'` | Text direction. |
| `toolbar` | `string` | *(preset)* | Custom toolbar layout string. |
| `toolbar_mode` | `'sliding' \| 'floating' \| 'wrap'` | `'wrap'` | Toolbar overflow behavior. |
| `toolbar_sticky` | `boolean` | `true` | Pin toolbar at top when scrolling. |
| `auto_focus` | `string` | &mdash; | Auto-focus on init. |
| `browser_spellcheck` | `boolean` | `true` | Enable browser spell check. |
| `entity_encoding` | `'raw' \| 'named' \| 'numeric'` | `'raw'` | HTML entity encoding mode. |
| `includeTemplates` | `boolean` | `false` | Show the template dropdown. |
| `templates` | `Template[]` | `[]` | Predefined HTML templates. |
| `dropbox` | `boolean` | `false` | Enable Dropbox integration. |
| `images_upload_url` | `string` | &mdash; | Server endpoint for image uploads. |
| `images_upload_credentials` | `boolean` | `true` | Include credentials with upload requests. |
| `images_upload_base_path` | `string` | `'/'` | Prefix for uploaded image URLs. |
| `images_upload_max_size` | `number` | `10485760` | Max upload size in bytes (10 MB). |
| `images_upload_headers` | `Record<string, string>` | &mdash; | Extra headers for upload requests. |
| `setup` | `(editor) => void` | &mdash; | Pre-init callback for registering custom toolbar buttons. |

### Dark Theme

```tsx
<Editor
  config={{
    skin: 'oxide-dark',
    content_css: 'dark',
  }}
/>
```

### Custom Content Styles

```tsx
<Editor
  config={{
    content_style: 'body { font-family: Georgia, serif; font-size: 16px; line-height: 1.6; }',
  }}
/>
```

## Templates

Enable the template dropdown and provide a `templates` array:

```tsx
import type { Template } from '@mdaemon/html-editor-react';

const templates: Template[] = [
  {
    title: 'Greeting',
    description: 'A friendly greeting',
    content: '<p>Hello! Thank you for reaching out.</p>',
  },
  {
    title: 'Signature',
    content: '<p>Best regards,<br/>Your Name</p>',
  },
];

<Editor
  config={{
    includeTemplates: true,
    templates,
  }}
/>
```

The `Template` interface:

```typescript
interface Template {
  id?: number | string;
  title: string;
  description?: string;
  content: string;
}
```

## Custom Toolbar Buttons

Register custom buttons via the `setup` callback in `config`:

```tsx
<Editor
  config={{
    setup: (editor) => {
      editor.ui.registry.addButton('myButton', {
        tooltip: 'Insert greeting',
        text: 'Greet',
        onAction: (api) => {
          editor.insertContent('<p>Hello from a custom button!</p>');
        },
        onSetup: (api) => {
          // api.isEnabled(), api.setEnabled(bool)
          // api.isActive(), api.setActive(bool)
        },
      });
    },
    toolbar: 'bold italic | myButton',
  }}
/>
```

### Button Options

| Option | Type | Description |
|--------|------|-------------|
| `tooltip` | `string` | Hover text. |
| `text` | `string` | Button label. |
| `icon` | `string` | Image URL (used instead of text). |
| `disabled` | `boolean` | Initial disabled state. |
| `onSetup` | `(api) => void \| (() => void)` | Called on creation; may return a teardown function. |
| `onAction` | `(api) => void` | Called on click. |

### Button API

The `api` object passed to `onSetup` and `onAction`:

| Method | Description |
|--------|-------------|
| `isEnabled()` | Returns current enabled state. |
| `setEnabled(enabled)` | Enable or disable the button. |
| `isActive()` | Returns active/pressed state. |
| `setActive(active)` | Toggle active/pressed visual style. |

## Custom Toolbar Layout

Provide a `toolbar` string to control which buttons appear and in what order. Use `|` to group buttons and `||` to create a collapsible overflow section:

```tsx
<Editor
  config={{
    toolbar: 'bold italic underline | fontfamily fontsize || forecolor backcolor | undo redo',
  }}
/>
```

Buttons after `||` begin collapsed behind a toggle (`...`) button.

### Available Toolbar Buttons

| Button | Action |
|--------|--------|
| `bold` | Toggle bold |
| `italic` | Toggle italic |
| `underline` | Toggle underline |
| `strikethrough` | Toggle strikethrough |
| `bullist` | Bullet list |
| `numlist` | Numbered list |
| `outdent` | Decrease indent |
| `indent` | Increase indent |
| `blockquote` | Toggle block quote |
| `fontfamily` | Font family dropdown |
| `fontsize` | Font size dropdown |
| `lineheight` | Line height dropdown |
| `template` | Template dropdown (requires `includeTemplates: true`) |
| `alignleft` | Left align |
| `aligncenter` | Center align |
| `alignright` | Right align |
| `alignjustify` | Justify |
| `forecolor` | Text color picker |
| `backcolor` | Highlight color picker |
| `removeformat` | Strip all formatting |
| `copy` | Copy selection |
| `cut` | Cut selection |
| `paste` | Paste from clipboard |
| `undo` | Undo |
| `redo` | Redo |
| `image` | Insert image (upload or URL) |
| `charmap` | Special character picker |
| `emoticons` | Emoji picker with search |
| `code` | Toggle code block |
| `link` | Insert/edit hyperlink |
| `codesample` | Toggle code sample |
| `fullscreen` | Toggle fullscreen |
| `preview` | Preview in new window |
| `searchreplace` | Find & Replace dialog |
| `ltr` | Left-to-right direction |
| `rtl` | Right-to-left direction |

## Image Upload

The image toolbar button opens a dialog supporting drag-and-drop upload or direct URL entry. Supported formats: JPEG, PNG, GIF, WebP, SVG.

When `images_upload_url` is configured, files are posted as `multipart/form-data`. The server must return JSON with a `location`, `url`, or `link` field. Without an upload URL, images are embedded as base64 data URIs.

SVGs are automatically sanitized (script tags, event handlers, and dangerous elements are stripped).

```tsx
<Editor
  config={{
    images_upload_url: '/api/upload',
    images_upload_credentials: true,
    images_upload_base_path: '/files/',
    images_upload_max_size: 5 * 1024 * 1024,
    images_upload_headers: {
      'X-CSRF-Token': csrfToken,
    },
  }}
/>
```

## Localization

### Set Language at Init

```tsx
<Editor config={{ language: 'de' }} />
```

### Custom Translation Function

```tsx
import { setTranslate } from '@mdaemon/html-editor-react';

setTranslate((key) => myTranslations[key] ?? key);

// Or via the Editor prop:
<Editor translate={(key) => myTranslations[key] ?? key} config={{}} />
```

### Change Language at Runtime

```tsx
const editorRef = useRef<EditorRef>(null);

// Switch to French
editorRef.current?.getEditor()?.setLanguage('fr');
```

### Supported Languages

| Code | Language | Code | Language |
|------|----------|------|----------|
| `en` | English | `nl` | Nederlands |
| `ar` | العربية | `nb` | Norsk bokmal |
| `ca` | Catala | `pl` | Polski |
| `zh` | Chinese | `pt` | Portugues |
| `cs` | Cesky | `ro` | Romana |
| `da` | Dansk | `ru` | Russian |
| `en-gb` | English (UK) | `sr` | Srpski |
| `fi` | Suomi | `sl` | Slovenscina |
| `fr` | Francais | `es` | Espanol |
| `fr-ca` | Canadien francais | `sv` | Svenska |
| `de` | Deutsch | `zh-tw` | Chinese (Taiwan) |
| `el` | Greek | `th` | Thai |
| `hu` | Magyar | `tr` | Turkce |
| `id` | Bahasa Indonesia | `vi` | Tieng Viet |
| `it` | Italiano | | |
| `ja` | Japanese | | |
| `ko` | Korean | | |

## File Source Resolver

Transform image `src` attributes globally, useful for CDN prefixing or relative path resolution:

```tsx
import { setGetFileSrc } from '@mdaemon/html-editor-react';

setGetFileSrc((path) => `https://cdn.example.com${path}`);

// Or via the Editor prop:
<Editor getFileSrc={(path) => `https://cdn.example.com${path}`} config={{}} />
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl/Cmd + B | Bold |
| Ctrl/Cmd + I | Italic |
| Ctrl/Cmd + U | Underline |
| Ctrl/Cmd + Z | Undo |
| Ctrl/Cmd + Shift + Z | Redo |
| Ctrl/Cmd + F | Find & Replace |

## Form Integration

Use the `name` prop to render a hidden `<input>` containing the editor content, useful for traditional form submission:

```tsx
<form onSubmit={handleSubmit}>
  <Editor
    config={{}}
    name="email_body"
    initialValue="<p>Draft content</p>"
  />
  <button type="submit">Send</button>
</form>
```

## Exports

```tsx
// Components
import { Editor, MDEditor } from '@mdaemon/html-editor-react'; // MDEditor is an alias

// Hook
import { useEditor } from '@mdaemon/html-editor-react';

// Global functions
import { getEditorContent, setEditorContent } from '@mdaemon/html-editor-react';

// Utilities (re-exported from @mdaemon/html-editor)
import { fontNames, setTranslate, setGetFileSrc } from '@mdaemon/html-editor-react';

// Types
import type {
  EditorProps,
  EditorRef,
  UseEditorOptions,
  UseEditorReturn,
  EditorConfig,
  EditorEvents,
  Template,
  ToolbarButtonSpec,
  ToolbarButtonAPI,
} from '@mdaemon/html-editor-react';
```

## Migration from `@tinymce/tinymce-react`

```tsx
// Before (TinyMCE)
import { Editor } from '@tinymce/tinymce-react';

<Editor
  apiKey="your-key"
  init={{ height: 400, plugins: 'link image table' }}
  initialValue="<p>Hello</p>"
  onEditorChange={(content) => save(content)}
/>

// After (MDHTMLEditor React)
import { Editor } from '@mdaemon/html-editor-react';
import '@mdaemon/html-editor/dist/styles.css';

<Editor
  config={{ height: 400 }}
  initialValue="<p>Hello</p>"
  onChange={(content) => save(content)}
/>
```

Key differences:

- No `apiKey` or `licenseKey` required
- `init` prop is renamed to `config`
- `onEditorChange` is renamed to `onChange`
- `plugins` option is not needed &mdash; all features are built in
- Toolbar customization uses `basicEditor: true/false` or a `toolbar` string

## Running the Demo

A demo app is included to see the editor in action:

```bash
npm run demo
```

This starts a Vite dev server at `http://localhost:5173` with examples of both the `<Editor>` component and `useEditor` hook.

## License

LGPL-3.0-or-later &mdash; [MDaemon Technologies, Ltd.](https://www.mdaemon.com)
