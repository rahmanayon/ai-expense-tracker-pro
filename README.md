# AI Expense Tracker Pro

> **A production-ready, AI-powered personal and business finance management platform.**

[![Production Readiness](https://img.shields.io/badge/readiness-review%20in%20progress-orange)](#)
[![License](https://img.shields.io/badge/license-MIT-blue)](#license)

---

## Overview

AI Expense Tracker Pro enables individuals and businesses to:

- **Track income & expenses** across multiple currencies and categories
- **Scan receipts** with OCR to automatically extract transaction data
- **Get AI-powered insights** — spending trends, budget forecasts, and anomaly detection
- **Manage investments** with live price tracking and ROI projections
- **Collaborate** with team members in multi-user workspaces
- **Export** financial reports as CSV, PDF, or Excel

---

## Repository Contents

| File | Description |
|---|---|
| [`BUBBLE_IO_PROMPT.md`](./BUBBLE_IO_PROMPT.md) | Complete, step-by-step Bubble.io app builder prompt covering all data types, pages, workflows, API integrations, styling, and security settings |
| [`PRODUCTION_READINESS_REPORT.md`](./PRODUCTION_READINESS_REPORT.md) | Detailed audit of the application's production readiness, including security findings, performance analysis, and a prioritised action checklist |
| [`CONTRIBUTING.md`](./CONTRIBUTING.md) | Contribution guidelines and development workflow |
| [`CHANGELOG.md`](./CHANGELOG.md) | Version history and change log |

---

## Quick Start — Bubble.io

To build this application in [Bubble.io](https://bubble.io):

1. Create a new Bubble app (requires **Production** plan for all features)
2. Open [`BUBBLE_IO_PROMPT.md`](./BUBBLE_IO_PROMPT.md) and follow the sections in order:
   - **Section 2** — Create all data types and fields
   - **Section 3** — Configure privacy rules
   - **Section 4** — Create all pages
   - **Sections 5–13** — Build each page's layout and workflows
   - **Section 15** — Configure API Connector integrations
   - **Section 16** — Install required plugins
   - **Section 17** — Set up backend and recurring workflows
   - **Sections 18–19** — Apply the design system and responsive breakpoints
   - **Sections 20–22** — Configure performance, security, and SEO settings
   - **Section 23** — Complete the deployment checklist before going live

---

## Technology Stack (Reference Architecture)

The production readiness report describes the reference tech stack that informed the Bubble.io prompt:

| Layer | Technology |
|---|---|
| Frontend | React + Next.js 18 / 14 |
| Backend API | Node.js + Express 4.18 |
| AI Engine | Python + FastAPI |
| Database | PostgreSQL 15 |
| Cache | Redis (ioredis) |
| Mobile | React Native (Expo) + Android (Kotlin) |
| Orchestration | Kubernetes |
| Monitoring | Prometheus + Grafana |
| Logging | Winston + ELK Stack |

---

## Production Status

See [`PRODUCTION_READINESS_REPORT.md`](./PRODUCTION_READINESS_REPORT.md) for the full audit. Summary:

| Category | Rating |
|---|---|
| Architecture | 🟡 Good with gaps |
| Security | 🔴 Needs work (10 blockers identified) |
| Performance | 🟡 Good with gaps |
| Operational Readiness | 🟠 Needs work |
| Testing | 🔴 Needs work |
| **Overall** | **🟠 Not yet production-ready** |

The 10 blockers that must be resolved before any production deployment are documented in [Section 10](./PRODUCTION_READINESS_REPORT.md#10-known-issues--critical-action-items) of the report.

---

## Contributing

Please read [`CONTRIBUTING.md`](./CONTRIBUTING.md) before submitting changes.

---

## License

MIT — see `LICENSE` for details.