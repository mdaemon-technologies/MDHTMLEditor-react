import { useState, useRef, useCallback } from 'react';
import { Editor, useEditor } from '../src';
import type { EditorRef } from '../src';
import type { HTMLEditor } from '@mdaemon/html-editor';

const sampleHTML = `
<h2>Welcome to MDHTMLEditor</h2>
<p>This is a <strong>rich text editor</strong> built on <a href="https://tiptap.dev">TipTap</a> and wrapped for React.</p>
<ul>
  <li>Full toolbar with formatting options</li>
  <li>Tables, images, and links</li>
  <li>Keyboard shortcuts</li>
</ul>
<p>Try editing this content!</p>
`;

function ComponentDemo() {
  const editorRef = useRef<EditorRef>(null);
  const [content, setContent] = useState('');
  const [dirty, setDirty] = useState(false);

  const handleGetContent = useCallback(() => {
    if (editorRef.current) {
      const html = editorRef.current.getContent();
      setContent(html);
    }
  }, []);

  const handleInsert = useCallback(() => {
    editorRef.current?.insertContent('<p><em>Inserted at cursor!</em></p>');
  }, []);

  return (
    <section>
      <h2>Editor Component</h2>
      <p className="description">
        The <code>&lt;Editor&gt;</code> component provides a declarative API with
        props for callbacks and a ref for imperative control.
      </p>

      <Editor
        ref={editorRef}
        config={{}}
        initialValue={sampleHTML}
        onDirty={(d) => setDirty(d)}
        onChange={(html) => setContent(html)}
        onInit={() => console.log('Editor initialized')}
        onFocus={() => console.log('Editor focused')}
        onBlur={() => console.log('Editor blurred')}
      />

      <div className="controls">
        <button onClick={handleGetContent}>Get Content</button>
        <button onClick={handleInsert}>Insert HTML</button>
        <button onClick={() => editorRef.current?.focus()}>Focus</button>
        <span className="status">
          {dirty ? '● Unsaved changes' : '○ Clean'}
        </span>
      </div>

      {content && (
        <details open>
          <summary>Raw HTML Output</summary>
          <pre><code>{content}</code></pre>
        </details>
      )}
    </section>
  );
}

function HookDemo() {
  const [content, setContent] = useState('');
  const { containerRef, ready, getContent, setContent: setEditorContent, insertContent, focus, isDirty } = useEditor({
    config: {},
    content: '<p>This editor is powered by the <code>useEditor</code> hook.</p>',
    onUpdate: (html) => setContent(html),
  });

  return (
    <section>
      <h2>useEditor Hook</h2>
      <p className="description">
        The <code>useEditor</code> hook gives you full programmatic control.
        Attach the returned <code>containerRef</code> to any div.
      </p>

      <div ref={containerRef} />

      <div className="controls">
        <button onClick={() => setContent(getContent())}>Get Content</button>
        <button onClick={() => setEditorContent('<p>Content was reset!</p>')}>Reset Content</button>
        <button onClick={() => insertContent('<p><strong>Injected!</strong></p>')}>Insert HTML</button>
        <button onClick={focus}>Focus</button>
        <span className="status">
          Ready: {ready ? 'Yes' : 'No'} | Dirty: {isDirty() ? 'Yes' : 'No'}
        </span>
      </div>

      {content && (
        <details open>
          <summary>Raw HTML Output</summary>
          <pre><code>{content}</code></pre>
        </details>
      )}
    </section>
  );
}

function FontDemo() {
  const editorRef = useRef<EditorRef>(null);
  const probeRef = useRef<HTMLInputElement>(null);
  const [family, setFamily] = useState('');
  const [size, setSize] = useState('');
  const [focusReport, setFocusReport] = useState('');
  const [content, setContent] = useState('');

  const handleInit = useCallback((editor: HTMLEditor) => {
    // The editor must not pull focus away from the field that had it (fixed in 1.8.0).
    const kept = document.activeElement === probeRef.current;
    setFocusReport(kept ? 'input still focused ✓' : 'editor stole focus ✗');

    const sync = () => {
      setFamily(editor.getFontFamily());
      setSize(editor.getFontSize());
    };
    sync();

    // The editor has no selection event of its own, so listen on the TipTap instance.
    const tiptap = editor.getTipTap();
    tiptap?.on('selectionUpdate', sync);
    tiptap?.on('transaction', sync);
  }, []);

  const setBlockFamily = useCallback((value: string) => {
    editorRef.current?.getEditor()?.getTipTap()?.chain().focus().setBlockFontFamily(value).run();
  }, []);

  const setBlockSize = useCallback((value: string) => {
    editorRef.current?.getEditor()?.getTipTap()?.chain().focus().setBlockFontSize(value).run();
  }, []);

  return (
    <section>
      <h2>Fonts</h2>
      <p className="description">
        The configured <code>fontName</code> / <code>fontSize</code> are inlined on every block,
        so they survive export. <code>getFontFamily()</code> and <code>getFontSize()</code> report
        the font in effect at the cursor — move the caret between the paragraphs below and watch
        both the toolbar's font buttons and the readout follow it. Select across the first two
        paragraphs and both blank out, because the selection spans two fonts. Set a font in the
        empty paragraph and it persists instead of being discarded when the selection moves.
      </p>

      <label className="probe">
        Focus probe (autofocused on load):{' '}
        <input ref={probeRef} autoFocus defaultValue="the editor should not take this focus" />
      </label>

      <Editor
        ref={editorRef}
        config={{
          height: 250,
          fontName: 'Georgia, serif',
          fontSize: '14pt',
        }}
        initialValue={
          '<p>This paragraph carries the configured block font.</p>' +
          '<p><span style="font-family: Courier New, monospace">This span overrides it inline.</span></p>' +
          '<p></p>'
        }
        onInit={handleInit}
        onChange={(html) => setContent(html)}
      />

      <div className="controls">
        <button onClick={() => setBlockFamily('Comic Sans MS, cursive')}>Block font → Comic Sans</button>
        <button onClick={() => setBlockFamily('Georgia, serif')}>Block font → Georgia</button>
        <button onClick={() => setBlockSize('24pt')}>Block size → 24pt</button>
        <button onClick={() => setBlockSize('14pt')}>Block size → 14pt</button>
      </div>

      <div className="controls">
        <span className="status readout">
          At cursor: <code>{family || '—'}</code> / <code>{size || '—'}</code> · Focus on init:{' '}
          {focusReport || '—'}
        </span>
      </div>

      {content && (
        <details open>
          <summary>Raw HTML Output</summary>
          <pre><code>{content}</code></pre>
        </details>
      )}
    </section>
  );
}

export default function App() {
  return (
    <div className="app">
      <header>
        <h1>@mdaemon/html-editor-react Demo</h1>
        <p>A WYSIWYG HTML editor React wrapper — drop-in replacement for TinyMCE React.</p>
      </header>

      <ComponentDemo />
      <hr />
      <HookDemo />
      <hr />
      <FontDemo />

      <style>{`
        * { box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          margin: 0;
          padding: 0;
          background: #f5f5f5;
          color: #333;
        }
        .app {
          max-width: 960px;
          margin: 0 auto;
          padding: 2rem 1rem;
        }
        header {
          margin-bottom: 2rem;
        }
        header h1 {
          margin: 0 0 0.25rem;
          font-size: 1.75rem;
        }
        header p {
          margin: 0;
          color: #666;
        }
        section {
          background: #fff;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 2rem;
        }
        section h2 {
          margin: 0 0 0.5rem;
          font-size: 1.25rem;
        }
        .description {
          margin: 0 0 1rem;
          color: #555;
          font-size: 0.9rem;
        }
        .controls {
          display: flex;
          gap: 0.5rem;
          align-items: center;
          margin-top: 1rem;
          flex-wrap: wrap;
        }
        button {
          padding: 0.4rem 0.8rem;
          border: 1px solid #ccc;
          border-radius: 4px;
          background: #fff;
          cursor: pointer;
          font-size: 0.85rem;
        }
        button:hover {
          background: #f0f0f0;
        }
        .status {
          margin-left: auto;
          font-size: 0.85rem;
          color: #888;
        }
        .status.readout {
          margin-left: 0;
        }
        .probe {
          display: block;
          margin-bottom: 1rem;
          font-size: 0.85rem;
          color: #555;
        }
        .probe input {
          padding: 0.4rem 0.6rem;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-size: 0.85rem;
          min-width: 20rem;
        }
        details {
          margin-top: 1rem;
        }
        summary {
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }
        pre {
          background: #1e1e1e;
          color: #d4d4d4;
          padding: 1rem;
          border-radius: 4px;
          overflow-x: auto;
          font-size: 0.8rem;
          max-height: 300px;
        }
        hr {
          border: none;
          border-top: 1px solid #ddd;
          margin: 2rem 0;
        }
        code {
          background: #eee;
          padding: 0.1rem 0.3rem;
          border-radius: 3px;
          font-size: 0.85em;
        }
        pre code {
          background: none;
          padding: 0;
        }
        .md-editor-react-wrapper,
        [class*="md-editor"] {
          margin-top: 0.5rem;
        }
      `}</style>
    </div>
  );
}
