# Disaster Relief Coordination Platform

This repository contains the base setup for a full-stack Disaster Relief Coordination Platform built using Next.js (TypeScript). This Sprint-1 deliverable focuses on initializing a clean, scalable project structure.

---

## Problem Statement

Disaster relief operations often face delays due to uncoordinated data sharing between NGOs and government bodies. This project aims to build a scalable platform to improve coordination and data visibility.

---

## Sprint 1 – Project Initialization

The objective of Sprint 1 is to set up a strong foundation using Next.js with TypeScript, following best practices for folder structure and documentation.

---

## Folder Structure
```
src/
├── app/
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home page
│   └── globals.css       # Global styles
│
├── components/
│   └── Header.tsx        # Reusable UI components
│
├── lib/
│   └── constants.ts     # Utilities and shared helpers
```

This structure ensures separation of concerns and supports scalability in future sprints.

---

## Setup Instructions

Install dependencies:
```
npm install
```

Run locally:
```
npm run dev
```
The application runs at ```http://localhost:3000```

---

## Local Run Screenshot

![Local App Running](docs/local-run.png)

---

## Reflection

This folder structure was chosen to keep the codebase modular and scalable. Separating routes, components, and shared logic allows parallel development and easier feature expansion in future sprints.

---

## Future Scope

- Authentication and role-based access
- NGO and Government dashboards
- Database and caching integration
- Docker, CI/CD, and cloud deployment

## 🔀 Team Branching & PR Workflow

To maintain code quality and smooth collaboration, our team follows a structured GitHub workflow inspired by real-world engineering practices.

---

### Branch Naming Strategy

We use the following branch naming conventions:

- `feature/<feature-name>` – New features
- `fix/<bug-name>` – Bug fixes
- `chore/<task-name>` – Maintenance tasks
- `docs/<update-name>` – Documentation updates

Example branches:
- `feature/login-auth`
- `fix/navbar-alignment`
- `docs/update-readme`

All development work is done on feature or fix branches. The `main` branch is protected and only updated through reviewed pull requests.

---

### Pull Request Template

We created a standardized PR template located at: ```.github/pull_request_template.md```

This template ensures every PR includes:
- A clear summary
- List of changes
- Screenshots or evidence
- A quality checklist before merging

---

### Code Review Checklist

Every pull request is reviewed using the following checklist:
- Code follows naming conventions and structure
- Feature verified locally
- No console errors or warnings
- ESLint and Prettier checks pass
- No sensitive data exposed
- Documentation updated if required

---

### Branch Protection Rules

The `main` branch is protected with the following rules:
- Pull request reviews required before merging
- At least one reviewer approval
- Required status checks must pass
- Direct pushes to `main` are disabled

This ensures all changes are reviewed and validated before reaching production.

---

### 📸 Pull Request Evidence

Below is a screenshot of a real pull request showing checks passing and review completed:

![PR Checks Passing](docs/pr-checks.png)

---

### Reflection

This workflow improves collaboration by enforcing consistency, code reviews, and automated checks. It helps prevent bugs, reduces merge conflicts, and ensures the codebase remains stable as the team scales.



