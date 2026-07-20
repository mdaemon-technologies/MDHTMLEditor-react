# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

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
