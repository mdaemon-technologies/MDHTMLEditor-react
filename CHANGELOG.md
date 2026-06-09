# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

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
