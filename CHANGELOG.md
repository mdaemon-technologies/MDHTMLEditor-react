# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

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
