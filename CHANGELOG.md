# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [1.8.3] - 2026-09-10

Dependency upgrade only &mdash; no changes to this package's API, props, ref methods, or
component behavior.

### Changed

- Upgraded `@mdaemon/html-editor` to `^1.12.3` (from `^1.12.2`)

### Fixed

Inherited from the underlying `@mdaemon/html-editor` 1.12.3 upgrade &mdash; three import
fixes, all of which show up when a stored email template is loaded:

- **A link with an empty `href` is no longer deleted on import.** `<a href="">` &mdash; the
  shape a template carries when the author wrote the link text and left the target for
  later, or when an upstream sanitizer blanked it &mdash; arrived as plain text, the anchor
  discarded and only its words kept. TipTap's link parse rule opens with
  `if (!href || !isAllowedUri(href)) return false`, so an empty string short-circuits to
  "not a link" before URI validation is ever consulted; a real template with nine such
  anchors lost all nine. The parse rule now accepts the empty-string case, which is also
  the shape TipTap itself *emits* &mdash; its `renderHTML` rewrites a URI it rejects to
  `href=""`. Security is unchanged: an absent `href` still fails (that is a named anchor),
  and every non-empty href still goes through `isAllowedUri`, so `javascript:` and `data:`
  targets are rejected exactly as before.
- **Container `<div>`s no longer import as a run of blank lines.** Mail clients and CMSes
  wrap stored HTML in several nested `<div>`s around the real content. The editor's schema
  has one block node per line and its content expression is `inline*`, so a block cannot
  contain a block: the ProseMirror parser opened a paragraph for each wrapper, closed it
  again to place the first block child, and left the wrapper behind as an empty paragraph.
  A template swaddled in five `<div>`s therefore opened with four blank lines that were
  never in the source. Import now dissolves a `<div>`/`<p>` holding only block-level
  children and no text of its own, hoisting its children into the parent.
- **A wrapper's font now reaches the lines it wrapped.** Following from the above: a body
  wrapped in one `<div style="font-family:Georgia;font-size:10pt">` stranded that style on
  the empty block the wrapper became, and every real line silently fell back to the
  editor's default font &mdash; the "11pt where the source says 10pt" drift seen on imported
  templates. The inherited properties (`font-family`, `font-size`, `font-weight`,
  `font-style`, `color`, `line-height`, `text-align`, `text-indent`, `direction`) are now
  carried down to the children, never overriding one a child already states. Box
  properties are not: border, background, padding and margin describe the wrapper itself
  and cannot be re-expressed on *n* children.

Blocks that own their nesting are exempt from the flattening and keep their structure:
`<blockquote>`, list items and table cells are real nodes with block content, the
signature container (`<div id="signature">`) is left intact for `SignatureBlock` to claim,
and a genuinely empty `<div></div>` is a blank line the author typed rather than a
wrapper. `<pre>` / code blocks are untouched.

All three fixes are in the engine's import path; this wrapper passes content straight
through, so consumers get them by upgrading the `@mdaemon/html-editor` dependency alone.
`@tiptap/react` stays at `^3.31.3` &mdash; 1.12.3 does not move TipTap.

The wrapper's Jest suite (72 tests), `tsc --noEmit`, ESLint, and the production build all
pass against the new version.

## [1.8.2] - 2026-09-08

Dependency upgrade only &mdash; no changes to this package's API, props, ref methods, or
component behavior.

### Changed

- Upgraded `@mdaemon/html-editor` to `^1.12.2` (from `^1.12.1`)

### Fixed

Inherited from the underlying `@mdaemon/html-editor` 1.12.2 upgrade:

- **A pretty-printed template no longer imports with extra bullets and stray blank
  blocks.** Stored templates are usually kept as authored &mdash; indented, one block per
  line &mdash; so real newlines and tabs sit between the block elements, including as
  direct children of `<ul>`. `insertContent()` (the path the Templates dropdown uses)
  preserved that whitespace, and because ProseMirror cannot place a bare text node inside
  `bullet_list`, it wrapped each whitespace run in a list item of its own: a 2-bullet list
  arrived as 4 bullets, each inter-block newline run became an empty `<div>`, and the
  surviving tabs rendered as visible breaks. `setContent()` and `insertContent()` now both
  parse with `preserveWhitespace: false`, the collapse-per-HTML-rules mode a browser
  itself uses. `<pre>` / code blocks keep their indentation, and Ctrl+V is unaffected.
- **A block containing only `&nbsp;` is no longer treated as an empty line.**
  `format_empty_lines` appends a `<br>` to blank blocks so they keep their height outside
  the editor, but its emptiness test used `String.prototype.trim()`, which strips U+00A0.
  A deliberate `<div>&nbsp;</div>` spacer therefore exported as `<div>&nbsp;<br></div>`
  and rendered at double height in the sent message. Both the serializer and its
  import-time inverse now measure emptiness against ASCII whitespace only, so an `&nbsp;`
  counts as the visible content it is and round-trips unchanged.

Both fixes are in the engine; this wrapper passes content straight through, so consumers
get them by upgrading the `@mdaemon/html-editor` dependency alone. `@tiptap/react` stays
at `^3.31.3` &mdash; 1.12.2 does not move TipTap.

The wrapper's Jest suite (72 tests), `tsc --noEmit`, ESLint, and the production build all
pass against the new version.

## [1.8.1] - 2026-09-04

Dependency upgrade only &mdash; no changes to this package's API, props, ref methods, or
component behavior.

### Changed

- Upgraded `@mdaemon/html-editor` to `^1.12.1` (from `^1.12.0`)
- Upgraded `@tiptap/react` to `^3.31.3` (from `^3.27.4`)

The underlying `@mdaemon/html-editor` 1.12.1 release is itself a TipTap bump: all 21
`@tiptap/*` packages it depends on moved from 3.27.4 to 3.31.3 together. Raising
`@tiptap/react` to the same version keeps the whole ProseMirror stack on a single
resolved copy, so a consuming app's bundler does not end up with two versions of
`@tiptap/core` / `@tiptap/pm` &mdash; which ProseMirror does not tolerate (duplicate
`prosemirror-model` schemas throw at runtime). If your app also depends on `@tiptap/*`
directly, upgrade it to 3.31.3 as well.

This is a patch-level move inside TipTap 3.x with no public API, config, or runtime
behavior changes on either package's surface. The wrapper's Jest suite (72 tests),
`tsc --noEmit`, ESLint, and the production build all pass against the new versions.

## [1.8.0] - 2026-08-31

### Changed

- Upgraded `@mdaemon/html-editor` to `^1.12.0` (from `^1.11.1`)

### Added

Inherited from the underlying `@mdaemon/html-editor` 1.12.0 upgrade:

- **Ordered lists now render with the numbering style they declare.** `<ol type="A">`,
  `type="a"`, `type="I"`, `type="i"` and `start="N"` already round-tripped through
  `setContent()` / `getContent()`, but the editor's own stylesheet forced
  `list-style-type: decimal` on screen &mdash; an HTML `type` attribute is only a
  presentational hint, which any author CSS outranks &mdash; so every lettered or roman
  list *displayed* as 1, 2, 3. Each `type` value now has an explicit rule and the
  nesting defaults are scoped with `:not([type])`, so a host-app CSS reset cannot strip
  the markers off a typed list either. A list that states its style in CSS
  (`<ol style="list-style-type:upper-alpha">`) is read the same way and exported as
  `<ol type="A">`. This is a **visible rendering change** for content that carries
  `type` or `start`.
- **Increase / decrease indent now work inside lists.** The toolbar buttons,
  `execCommand('indent' | 'outdent')` and <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd>
  share one context-aware pair of commands, so the three can no longer disagree. In a
  list, increase indent nests the item where it can and otherwise adds a `margin-left`;
  decrease indent takes that margin back first and then un-nests. The margin is written
  to the `<li>` rather than the paragraph inside it, so the bullet or number moves with
  the text, and it survives in exported HTML &mdash; in a mail client, say &mdash;
  without the editor's stylesheet.

### Fixed

Fixes inherited from the underlying `@mdaemon/html-editor` 1.12.0 upgrade:

- **Pasting a numbered list from Word or Outlook no longer indents it an extra level.**
  Office email HTML often contains a genuine `<ol>` whose `<li>`s *also* carry Word's
  `MsoListParagraph` class and `mso-list` metadata; the Word-list converter read those
  items as fake-list paragraphs and built a second list around them, producing
  `<ol><ol>&hellip;</ol></ol>` &mdash; a phantom empty item plus a list one level too
  deep. Such items are now cleaned in place.
- **Pasted lists no longer carry the source document's own indentation.** Word writes
  `margin-left:.5in;text-indent:-.25in` on every list paragraph and Google Docs writes
  `padding-inline-start:48px` on the list; stacked on top of the editor's list indent, a
  pasted list sat further right than one built with the toolbar. Inline
  left-indentation is now stripped from pasted `<ol>`/`<ul>`/`<li>` &mdash; nesting is
  structural, so nothing is lost &mdash; on every paste, not just Office content.
  Indentation on pasted paragraphs and blockquotes is untouched.
- **Pasting a lettered or roman list from Word no longer renumbers it to 1, 2, 3.**
  `mso-level-number-format` had been reduced to a single ordered/unordered boolean; it
  now maps to the list's `type`, and `mso-level-start-at` is read into `start`.
- **A Word list pasted without `@list` rules no longer arrives as a bullet list.** Many
  clipboards carry no `@list` block at all, and the missing rule defaulted to unordered.
  The numbering is now inferred from the marker text Word inlines (`1.`, `A.`, `iv.`,
  `&middot;`), including the starting number; an explicit `@list` rule still wins.
- Decrease indent was a silent no-op on the first item of a list, as was increase
  indent &mdash; the <kbd>Tab</kbd> key already had the fallback the toolbar buttons
  lacked.
- Increase indent could apply two steps for one press, by indenting both a node and its
  descendants; it now adjusts only the outermost indentable node in each branch.

`paste_from_office: false` still turns off Word/Excel cleaning as a whole; list
indentation is normalized either way.

### Documentation

- New **Lists & Indentation** section in the README covering the indent behavior per
  context, ordered-list numbering, and how pasted lists are normalized. The `indent` /
  `outdent` toolbar-button and <kbd>Tab</kbd> keyboard-shortcut descriptions were
  updated to match.

## [1.7.1] - 2026-08-17

### Changed

- Upgraded `@mdaemon/html-editor` to `^1.11.1` (from `^1.11.0`)

### Fixed

Inherited from the underlying `@mdaemon/html-editor` 1.11.1 upgrade:

- **The confab skin's `blockquote` toolbar icon was replaced.** The old icon drew two
  closing curly quotation marks whose tails made it read as "99"; it is now a quote bar
  beside indented text lines, matching the other line-based icons in the set. This only
  affects the `'confab'` / `'confab-dark'` skins.

## [1.7.0] - 2026-08-12

### Changed

- Upgraded `@mdaemon/html-editor` to `^1.11.0` (from `^1.10.1`)

### Added

Inherited from the underlying `@mdaemon/html-editor` 1.11.0 upgrade:

- **The text color and highlight color pickers now have separate palettes, and the text
  palette is built for readable text.** Both pickers previously shared one 26-swatch list
  chosen for highlighting: a grayscale ramp, the fully-saturated hues, and eight pale
  tints &mdash; roughly half of it illegible as a font color on a white background, with
  no dark shades at all. **`forecolor` (text)** now offers 40 colors in four rows of ten,
  aligned by hue column: the grayscale ramp, the saturated hues, and two rows of
  progressively darker shades. **`backcolor` (highlight)** keeps the original 26 colors
  unchanged &mdash; the pale tints are exactly what makes a good marker. This is a
  **visible toolbar change** if your users rely on the color pickers.
- **Both palettes are configurable through the pass-through `config` prop, with
  TinyMCE-compatible keys.** `color_map_foreground` and `color_map_background` set one
  picker each; `color_map` sets both and is overridden by either specific key. All three
  accept TinyMCE's flat form (`['#FF0000', 'Red', ...]`) or an array of `ColorOption`
  objects. Omitting them keeps the per-picker built-in defaults.
- **Both pickers gained a `Remove color` entry.** Color could previously only be cleared
  with `removeformat`, which strips *every* mark on the selection &mdash; clearing a font
  color also lost its bold, italic, and font size. The new entry clears only the color.
  `execCommand` gained the matching behavior: passing `''` or `'none'` as the value to
  `forecolor`, `backcolor`, or `hilitecolor` clears instead of setting.

### Fixed

Fixes inherited from the underlying `@mdaemon/html-editor` 1.11.0 upgrade:

- The `forecolor`/`backcolor` menus are portaled to `document.body` and carried nothing
  to identify which picker they belonged to; they now carry a `data-colorpicker-menu`
  attribute, so custom CSS or tests can target each picker's menu.
- Removed a duplicated `padding` declaration on `.md-toolbar-colorpicker-menu`.

## [1.6.1] - 2026-07-24

### Changed

- Upgraded `@mdaemon/html-editor` to `^1.10.1` (from `^1.10.0`)

### Fixed

Fixes inherited from the underlying `@mdaemon/html-editor` 1.10.1 upgrade:

- **`onChange` now receives exactly what `getContent()` returns.** The blank-line
  handling described under 1.6.0 lived only in `getContent()` / `setContent()`; the
  `change` event emitted the engine's raw HTML instead. So an `<Editor onChange={...}>`
  or a `useEditor({ onUpdate })` that saved the payload directly &mdash; the usual
  autosave / draft-sync / controlled-value pattern &mdash; stored content whose blank
  lines carried no `<br>` and collapsed to zero height when rendered outside the editor,
  while the same component's `getContent()` returned the corrected HTML. The two are now
  byte-identical.
- **Every other path in and out of the editor now applies the same pair of passes**, so
  the input and output sides can no longer disagree:
  - `insertContent()` no longer doubles blank lines when handed a fragment that came from
    `getContent()` (a saved snippet, a stored draft) &mdash; it previously skipped the
    import-side strip and passed the export-only `<br>` to TipTap as a hard break.
  - The **Templates** dropdown (`includeTemplates` / `templates`) went through TipTap
    directly and applied neither pass; it now routes through `insertContent()`.
  - The **source dialog** displayed raw HTML and saved raw HTML, so opening it and
    pressing Save without editing was not a no-op and could double blank lines.
  - **Preview** rendered raw HTML in the new window &mdash; exactly the out-of-editor
    context `format_empty_lines` exists for &mdash; so previewed blank lines collapsed
    while the sent content kept them.

  `format_empty_lines: false` still opts out of both directions on every path.

## [1.6.0] - 2026-07-20

### Changed

- Upgraded `@mdaemon/html-editor` to `^1.10.0` (from `^1.9.0`, picking up 1.9.1,
  1.9.2, 1.9.3, and 1.10.0)

### Added

Inherited from the underlying `@mdaemon/html-editor` 1.10.0 upgrade:

- **`Tab` / `Shift+Tab` now indent, and no longer escape the editor.** Previously
  `Tab` only did anything inside a list &mdash; anywhere else it moved keyboard focus
  out of the editor to the next element on the page. `Tab` now adds a left indent to
  the paragraph(s) or heading(s) in the selection (and `Shift+Tab` removes it), while
  keeping the context-aware behavior elsewhere: it still moves between cells in a
  table, inserts a literal tab in a code block, and nests / lifts list items. The
  `indent` / `outdent` toolbar buttons and `execCommand('indent' | 'outdent')` follow
  the same rule (list &rarr; nest, otherwise &rarr; block indent). The indent is stored
  as an inline `margin-left` (40px steps, up to 400px), so it survives in the exported
  HTML when the content is rendered without the editor stylesheet &mdash; an email body
  in another client, for example &mdash; and an incoming `margin-left` is read back as
  the starting indent.
- **A keyboard escape hatch keeps the editor from trapping focus** (WCAG 2.1.2, "No
  Keyboard Trap"). Because `Tab` is now captured, pressing **`Esc` then `Tab`** moves
  focus to the next focusable element outside the editor instead of indenting, and
  **`Esc` then `Shift+Tab`** moves to the previous one. `Esc` arms this for a single
  key press; any other key disarms it.

### Fixed

Fixes inherited from the underlying `@mdaemon/html-editor` upgrade:

- **Blank lines survive being rendered outside the editor, and are stable across
  round-trips** (1.9.1, 1.9.3). TipTap serializes an empty line as a bare
  `<p></p>` / `<div></div>`, which collapses to zero height in mail clients and other
  consumers &mdash; so blank lines a user typed appeared to vanish on send.
  `getContent()` now injects a `<br>` into each empty block, and `setContent()` runs
  the exact inverse and strips it back out on import, so a re-imported blank line is
  modeled as one genuinely empty line rather than doubling on every save/reload cycle.
  `setContent(getContent(x))` is now stable across any number of round-trips. This is
  gated on the existing `format_empty_lines` option (default `true`); set it to
  `false` to pass the engine's output through unchanged in both directions.
- **`Ctrl/Cmd+B`, `Ctrl+I`, `Ctrl+U`, and `Ctrl+Z` work again** (1.9.2). These chords
  were being handled twice &mdash; once by TipTap and once by a redundant toolbar
  listener &mdash; so the two toggles cancelled out (bold/italic/underline appeared to
  do nothing) and `Ctrl+Z` undid two steps at once. Holding `Shift` slipped past the
  duplicate listener, which is why the marks only seemed to work with `Ctrl+Shift`
  held. The redundant bindings were removed; `Ctrl/Cmd+F` (Find & Replace) is
  unaffected and still handled by the toolbar.
- **Content whose closing-tag slashes were backslash-escaped (`<\/p>`, `<\/li>`) now
  imports as real tags instead of literal garbage text** (1.10.0). Some hosts serialize
  the editor's HTML through encoders that escape `/` as `\/` &mdash; most notably PHP's
  `json_encode`, which does this by default. `setContent()`, `insertContent()`, and the
  Templates dropdown now normalize `<\/` back to `</` before parsing, restoring
  TinyMCE's lenient behavior.

## [1.5.0] - 2026-07-13

### Changed

- Upgraded `@mdaemon/html-editor` to `^1.9.0` (from `^1.6.0`, picking up 1.6.1, 1.7.0, 1.8.0, and 1.9.0)
- Upgraded `@tiptap/react` to `^3.27.4`
- **`getFontFamily()` / `getFontSize()` now return `''` for a selection spanning more than
  one value** (1.9.0). They previously reported the value at the selection *head*, so a
  selection covering both 12pt and 18pt text confidently answered "12pt". `getFontSize()`
  likewise returns `''` inside a heading with no inline override, since headings size by
  level and carry no block `font-size`. If you drive a custom font picker from these,
  treat `''` as "mixed / not applicable" and blank the control rather than falling back to
  a default. Collapsed cursors and single-value selections are unaffected.

### Fixed

Fixes inherited from the underlying `@mdaemon/html-editor` upgrade:

- **The editor no longer steals focus on init.** The engine used to focus the editor
  body while applying the configured `fontName` / `fontSize`, which overrode
  `auto_focus` / `setFocus` and clobbered any focus the host app had placed elsewhere
  &mdash; a common problem when an `<Editor>` mounts alongside other focusable fields
  (subject lines, recipient pickers) in a React form.
- **A font picked before typing is no longer discarded.** Choosing a font or size from
  the `fontfamily` / `fontsize` dropdowns while the cursor sat in an empty block only
  parked a transient mark that the next selection change dropped. Font changes made in
  an empty block are now written to the block itself, so they survive a re-render or a
  programmatic selection change and land in the exported HTML.
- The toolbar's font and size dropdown *menus* now check-mark the font actually in effect at
  the cursor, including when it comes from the block or the configured default.

### Added

- **The toolbar font dropdowns display the font and size at the cursor** (1.9.0). The
  `fontfamily` and `fontsize` buttons read "Georgia" / "14pt" and track the caret as it
  moves, instead of showing the static words "Font" and "Font size". A family is shown by
  its configured name (the label side of `font_family_formats`); a font that isn't in the
  configured list &mdash; pasted in from another editor, say &mdash; is shown by its first
  family name. Where no single value applies (a mixed selection, or font size in a heading)
  the button falls back to the generic word. This needs no change to your `<Editor>` usage,
  but it is a **visible toolbar change**: the two buttons now carry a fixed-width,
  ellipsized label, styled by new rules in `@mdaemon/html-editor/dist/styles.css`. Make
  sure that stylesheet is imported, and re-check any custom CSS layered on the toolbar.

Capabilities now available through `getEditor()`, courtesy of the underlying
`@mdaemon/html-editor` 1.8.0 upgrade:

- **`getFontFamily()` / `getFontSize()`** on the editor instance &mdash; report the font
  in effect at the cursor, resolving inline `<span>` override &rarr; block font &rarr;
  configured default (see *Changed* above for the mixed-selection behavior added in 1.9.0)
- **`setBlockFontFamily` / `setBlockFontSize`** TipTap commands (reachable via
  `getEditor()?.getTipTap()`) &mdash; set the font on every block the selection touches,
  rather than as an inline override

Other upstream changes:

- The underlying editor's production bundles are now minified, cutting the installed
  size of `@mdaemon/html-editor` substantially (1.7.0)
- `@mdaemon/html-editor` also ships a self-contained UMD build for `<script>` / CDN use
  (1.7.0). This does not affect the React wrapper, which is consumed through a bundler.

### Demo & Tooling

- The demo app (`npm run demo`) has a new **Fonts** section covering the new font behavior:
  a live `getFontFamily()` / `getFontSize()` readout that follows the cursor (and blanks to
  `—` on a mixed selection, mirroring the toolbar), `setBlockFontFamily` /
  `setBlockFontSize` buttons, and an autofocused input above the editor that reports
  whether the editor stole focus on init
- `npm run typecheck` (and therefore CI) now covers `demo/` in addition to `src/`, so the
  demo can no longer silently break against an upstream upgrade. Added `demo/vite-env.d.ts`
  for the CSS side-effect import, and pinned `tsconfig.build.json` to `src` so the
  declaration build is unaffected.

## [1.4.1] - 2026-06-12

Tooling and CI only &mdash; no changes to the published runtime API or component behavior.

### Added

- GitHub Actions CI workflow (`.github/workflows/ci.yml`) running lint, typecheck,
  and tests on Node 20, 22, 24, and 26 for pushes and pull requests to `master`
- ESLint flat config (`eslint.config.mjs`) with TypeScript and React rule sets

### Changed

- Upgraded the build toolchain to Vite 8 (Rolldown-based): `vite` `^8.0.16`,
  `@vitejs/plugin-react` `^6.0.2`, and `vite-plugin-dts` `^5.0.2`
- Renamed `build.rollupOptions` to `build.rolldownOptions` in `vite.config.ts`
  (the former is now a deprecated alias under Vite 8)

### Fixed

- Removed a Jest `moduleNameMapper` entry that resolved `@mdaemon/html-editor` to a
  local sibling-repo source path, which broke the test suite in clean/CI checkouts

## [1.4.0] - 2026-06-10

### Changed

- Upgraded `@mdaemon/html-editor` to `^1.6.0`

### Added

Capabilities now available through the pass-through `config` prop, courtesy of the
underlying `@mdaemon/html-editor` 1.6.0 upgrade:

- **Menu bar:** `menubar` toggles a TinyMCE-style menu bar above the toolbar (default `false`)
- **Context menu:** `contextmenu` (`boolean | string`) enables a right-click context menu;
  pass a button-list string to customize its contents
- **Quick toolbars (quickbars):** inline floating toolbars via
  `quickbars_selection_toolbar` (button-list string, default
  `'bold italic | quicklink blockquote'`), `quickbars_image_toolbar`, and
  `quickbars_insert_toolbar`
- **Element path:** `elementpath` shows a breadcrumb of the node path at the cursor
  in the status bar (default `false`)
- **Responsive toolbar controls:** `toolbar_narrow_breakpoint` (pixel width at which
  the toolbar collapses) and `toolbar_priority` (`Record<string, number>` per-button
  overflow priority)
- **Content validation:** `valid_children` for TinyMCE-style allowed-child rules
- **Focus targeting:** `setFocus` accepts a CSS selector to focus on init (used when
  `auto_focus` is not set)
- **TinyMCE compatibility:** a `plugins` string is accepted and ignored (all features
  are built in), easing migration from existing TinyMCE configs

## [1.3.0] - 2026-06-09

### Changed

- Upgraded `@mdaemon/html-editor` to `^1.5.0`

### Added

Capabilities now available through the pass-through `config` prop, courtesy of the
underlying `@mdaemon/html-editor` 1.5.0 upgrade:

- **New toolbar buttons:** `subscript`, `superscript`, `blocks` (alias `formatselect`),
  `styles`, `table`, `hr`, `unlink`, `anchor`, `speechtotext`, and `dictate`
- **Confab skins:** `skin` and `content_css` now accept `'confab'` / `'confab-dark'`
  in addition to `'oxide'` / `'oxide-dark'`
- **Read-only mode:** `readonly` config option plus `setReadOnly()` / `isReadOnly()`
  on the underlying editor (via `getEditor()`)
- **Block & style formats:** `block_formats` (block dropdown) and `style_formats`
  (named styles dropdown) config options
- **Enter behavior:** `forced_root_block` (`'p'` | `'div'`) for CKEditor `ENTER_DIV` parity
- **Image upload controls:** `images_file_types`, `images_upload_validate`, and
  `images_upload_error` for restricting and rejecting uploads
- **Sizing:** `min_height` and `max_height` config options
- **Paste & content options:** `paste_from_office`, `speech_to_text`,
  `convert_unsafe_embeds`, `format_empty_lines`, and `trailingNode`
- **CKEditor config aliases:** `font_names` (for `font_family_formats`) and
  `fontSize_sizes` (for `font_size_formats`)
- **New editor events:** `languagechange` and `templatechange`

## [1.2.1] - 2026-06-09

### Changed

- Upgraded `@mdaemon/html-editor` to `^1.4.2`

## [1.0.3] - 2025-05-14

### Added

- Initial public release of `@mdaemon/html-editor-react`
- `<Editor>` component with ref-based imperative API
- `useEditor` hook for programmatic editor control
- Global `getEditorContent` / `setEditorContent` convenience functions
- Re-exported types and utilities from `@mdaemon/html-editor`
- TinyMCE-compatible prop API (`body`, `initialValue`, `onChange`, `onInit`, etc.)
- `name` prop for hidden form input integration
- `disabled` prop for read-only mode
- `translate` and `getFileSrc` prop support
- Demo app (`npm run demo`)
- Full test suite with Jest + @testing-library/react
