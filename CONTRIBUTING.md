# Contributing to AI Expense Tracker Pro

Thank you for your interest in contributing! This document describes the workflow for contributing to this repository.

---

## What's in This Repository

This repository contains:

- **`BUBBLE_IO_PROMPT.md`** — The comprehensive Bubble.io app builder specification
- **`PRODUCTION_READINESS_REPORT.md`** — The production readiness audit
- **`README.md`** — Project overview

---

## How to Contribute

### Reporting Issues

- Use GitHub Issues to report errors, outdated information, or missing content in any of the documents
- Clearly describe the section and the nature of the problem
- If proposing a correction, include the suggested replacement text

### Submitting Changes

1. Fork the repository
2. Create a feature branch: `git checkout -b fix/short-description`
3. Make your changes (see guidelines below)
4. Commit with a clear message: `git commit -m "fix: correct OCR workflow step in BUBBLE_IO_PROMPT.md"`
5. Push to your fork: `git push origin fix/short-description`
6. Open a Pull Request against `main`

### Commit Message Format

Use [Conventional Commits](https://www.conventionalcommits.org):

| Prefix | When to use |
|---|---|
| `feat:` | New content or feature description |
| `fix:` | Correction to existing content |
| `docs:` | Meta-documentation (README, CONTRIBUTING) |
| `chore:` | Maintenance (renaming files, `.gitignore` changes) |

### Pull Request Guidelines

- Keep PRs focused: one logical change per PR
- Update `CHANGELOG.md` with a brief entry under the `[Unreleased]` heading
- Ensure all Markdown renders correctly (use a Markdown previewer before submitting)

---

## Document Style Guidelines

### BUBBLE_IO_PROMPT.md

- Field names in backticks: `field_name`
- API endpoint paths in backticks: `POST /extract-receipt`
- Use tables for field definitions (with Type and Notes columns)
- Keep workflow steps numbered and action-oriented ("Click X to do Y")
- Specify exact Bubble.io terminology (e.g. "Repeating Group", "Backend Workflow", "App Settings")

### PRODUCTION_READINESS_REPORT.md

- Findings are indexed (e.g. `S-01`, `P-02`) — preserve these IDs when updating
- Use the established severity rating: 🔴 Critical, 🟠 High, 🟡 Medium
- All issue descriptions should include Location and Risk columns

---

## Code of Conduct

Be respectful and constructive. Focus on improving the documentation rather than criticising prior work.
