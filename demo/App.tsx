import { useState, useRef, useCallback } from 'react';
import { Editor, useEditor } from '../src';
import type { EditorRef } from '../src';

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
