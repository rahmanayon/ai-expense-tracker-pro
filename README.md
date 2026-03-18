# AI Expense Tracker Pro

A comprehensive, full-stack AI-powered expense tracking application featuring a React/Next.js frontend, Node.js/Express backend, Python AI engine, and mobile applications (React Native & Android).

## Project Structure

This repository is organized as a monorepo containing the following components:

- **`backend/`**: Node.js + Express API service. Contains core business logic, database models, and API routes.
- **`frontend/`**: React + Next.js web application. The main user interface for the expense tracker.
- **`mobile/`**: React Native mobile application source code (also includes some Android native references).
- **`ai_engine/`**: Python FastAPI application for AI features like OCR (Receipt Scanning) and Spending Insights.
- **`database/`**: PostgreSQL schema definitions, migration scripts, and optimization queries.
- **`infrastructure/`**: Docker Compose files, Kubernetes manifests, and architecture diagrams.
- **`scripts/`**: Utility scripts for deployment, testing, security audits, and more.
- **`ui_mockups/`**: HTML/CSS prototypes of key application screens.
- **`tests/`**: Unit, integration, and performance test suites.

## Getting Started

### Prerequisites

- Node.js (v18+)
- Python (v3.9+)
- Docker & Docker Compose
- PostgreSQL (v15+)

### Quick Start (Docker)

To start the entire stack using Docker Compose:

```bash
docker-compose -f docker-compose.prod.yml up --build
```

### Manual Setup

#### Backend

```bash
cd backend
npm install
# Set up .env file based on config
npm run dev
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

#### AI Engine

```bash
cd ai_engine
pip install -r requirements.txt
uvicorn app:app --reload
```

## AI Features

- **Receipt Scanning**: Upload receipts to automatically extract merchant, date, and amount using `ai_engine`.
- **Spending Insights**: Get personalized financial advice based on your transaction history.

## Deployment

Deployment scripts are located in the `scripts/` directory:
- `deploy-production.sh`: Deploys the application to a production Kubernetes cluster.
- `mobile_release.sh`: Builds and prepares the mobile app for release.

## Contributing

Please refer to the `CONTRIBUTING.md` file (if available) or the project documentation in `docs/` for guidelines.

## License

[License Information Here]
