# Enterprise Code Formatting and Style Rules

This document outlines universal whitespace, character encoding, and typography standards enforced across all engineering repositories within `tupynambalucas-dev`.

## 1. Character Encoding & Line Endings

- **Encoding**: UTF-8 without Byte Order Mark (BOM).
- **Line Endings**: LF (`\n`). CRLF line endings are strictly blocked by pre-commit hooks and Git attributes (`* text=auto eol=lf`).

## 2. Indentation & Spacing

- **Standard (TypeScript, JavaScript, JSON, YAML, Markdown, CSS, HTML)**: 2 spaces.
- **Go (`*.go`)**: Tabs (tab width 4 spaces) per canonical `gofmt` specifications.
- **Makefiles (`Makefile`)**: Strict tabs required by POSIX standard.

## 3. Trailing Whitespace & Final Newline

- Every file must conclude with exactly one newline character (`insert_final_newline = true`).
- Trailing whitespace on line ends must be trimmed automatically on save, except in Markdown (`*.md`) where two trailing spaces denote hard line breaks.

## 4. Zero-Emoji Invariant

- Emojis are strictly forbidden across source code, comments, logs, and configuration files.
