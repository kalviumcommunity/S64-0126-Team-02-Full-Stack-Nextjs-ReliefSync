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

---

## 2.13 PostgreSQL Schema Design

### Overview

The database schema is designed with **3rd Normal Form (3NF)** principles to eliminate redundancy, ensure data consistency, and support scalable queries. The schema models the core entities required for the disaster relief coordination platform.

---

### Core Entities & Relationships

#### **Entity-Relationship Diagram**

```
┌─────────────┐
│   User      │
│─────────────┤
│ id (PK)     │
│ email       │──┐
│ name        │  │
│ passwordHash│  │
│ role        │  │
│ orgId (FK)  │  │
│ createdAt   │  │
└─────────────┘  │
       │         │
       └─────────┼────────┐
                 │        │
            ┌────────────────────┐
            │  Organization      │
            │────────────────────┤
            │ id (PK)            │
            │ name               │
            │ registrationNo     │──┐
            │ contactEmail       │  │
            │ contactPhone       │  │
            │ address            │  │
            │ isActive           │  │
            │ createdAt          │  │
            └────────────────────┘  │
                    │               │
         ┌──────────┴──────────┐    │
         │                     │    │
    ┌─────────────┐    ┌────────────────────┐
    │ Inventory   │    │ Allocation         │
    │─────────────┤    │────────────────────┤
    │ id (PK)     │    │ id (PK)            │
    │ orgId (FK)  │    │ fromOrgId (FK)     │
    │ itemId (FK) │    │ toOrgId (FK)       │
    │ quantity    │    │ itemId (FK)        │
    │ minThreshold│    │ quantity           │
    │ maxCapacity │    │ status             │
    │ lastUpdated │    │ requestedBy        │
    └─────────────┘    │ approvedBy (FK)    │
         │             │ requestDate        │
         │             │ approvedDate       │
         │             │ completedDate      │
         │             │ notes              │
         │             └────────────────────┘
         │                     │
         └─────────┬───────────┘
                   │
            ┌──────────────────┐
            │ InventoryItem    │
            │──────────────────┤
            │ id (PK)          │
            │ name             │
            │ description      │
            │ category (ENUM)  │
            │ unit (ENUM)      │
            │ createdAt        │
            └──────────────────┘
```

---

### Key Tables & Attributes

| Table | Purpose | Notable Columns |
|-------|---------|-----------------|
| **User** | Authentication & authorization | email (unique), role (enum), organizationId (FK) |
| **Organization** | NGO details | registrationNo (unique), isActive, address, city |
| **InventoryItem** | Relief supply definitions | name, category (enum), unit (enum) |
| **Inventory** | Org-specific stock levels | quantity, minThreshold, maxCapacity |
| **Allocation** | Resource requests & transfers | status (enum), requestDate, approvedDate, completedDate |

---

### Normalization & Design Rationale

#### **Why 3rd Normal Form (3NF)?**

1. **First Normal Form (1NF):**
   - All attributes contain atomic values (no arrays/nested objects)
   - No repeating groups
   - Example: `Inventory` stores a single quantity, not a list

2. **Second Normal Form (2NF):**
   - Meets 1NF requirements
   - All non-key attributes are fully dependent on the primary key
   - Example: `Inventory` has `organizationId` + `itemId` as composite candidate key

3. **Third Normal Form (3NF):**
   - Meets 2NF requirements
   - No transitive dependencies between non-key attributes
   - Example: Instead of storing `Organization` data in `User`, we use foreign keys

#### **Key Design Decisions**

| Aspect | Decision | Benefit |
|--------|----------|---------|
| **User Roles** | Enum (NGO/GOVERNMENT) | Type-safe, prevents invalid role values |
| **Inventory** | Composite unique key (org + item) | Prevents duplicates, supports aggregations |
| **Allocation Status** | Enum (6 states) | Clear workflow, prevents invalid statuses |
| **Cascading Deletes** | Varies by relationship | RESTRICT on critical links, CASCADE on dependent data |
| **Indexes** | On FK, email, status, dates | Fast queries for common access patterns |

---

### Constraints & Data Integrity

#### **Primary & Foreign Keys**
```
User.organizationId → Organization.id (SET NULL)
Inventory.organizationId → Organization.id (CASCADE)
Inventory.itemId → InventoryItem.id (RESTRICT)
Allocation.fromOrgId → Organization.id (SET NULL)
Allocation.toOrgId → Organization.id (RESTRICT)
Allocation.approvedBy → User.id (SET NULL)
```

#### **Unique Constraints**
- `User.email` – No duplicate emails
- `Organization.registrationNo` – Unique registration
- `InventoryItem(name, category)` – Prevent duplicate items
- `Inventory(organizationId, itemId)` – One record per org per item

---

### Database Migrations & Seeding

#### **Migrations Executed**
```bash
$ npx prisma migrate dev --name init_schema

Applied migration: 20260128060658_init_schema
```

All tables created successfully in PostgreSQL.

#### **Seeded Test Data**
```bash
$ npx prisma db seed

Created 3 NGO Organizations
Created 5 Users (2 Government, 3 NGO)
Created 8 Relief Item Types
Created 12 Inventory Records
Created 5 Allocation Records
```

**Test Login Credentials** (password: `password123`):
- Government: `admin@gov.in`, `coordinator@ndma.gov.in`
- Red Cross: `manager@redcross.india.org`
- Care India: `manager@careindia.org`
- Oxfam India: `manager@oxfamindia.org`

---

### Query Patterns & Performance

#### **Optimized Indexes**

| Index | Query Pattern | Use Case |
|-------|---------------|----------|
| `User(email)` | Find user by email | Login/authentication |
| `Inventory(organizationId)` | Get NGO inventory | NGO dashboard |
| `Allocation(status)` | List by workflow state | Government admin panel |
| `Inventory(quantity)` | Find low stock items | Threshold alerts |
| `Allocation(requestDate)` | Timeline queries | Audit logs |

#### **Example Prisma Query**
```typescript
// Low stock alert for NGO
const alerts = await prisma.inventory.findMany({
  where: {
    organizationId: ngoId,
    quantity: { lt: prisma.inventory.fields.minThreshold }
  },
  include: { item: true }
});

// Allocation approval workflow
const pending = await prisma.allocation.findMany({
  where: { status: 'PENDING' },
  orderBy: { requestDate: 'asc' },
  include: { fromOrg: true, toOrg: true }
});
```

---


**Visual Schema (Prisma Studio):**

![Prisma Studio Schema Visualization](docs/prisma-studio-schema.png)

This shows the complete database schema with all 5 tables (User, Organization, InventoryItem, Inventory, Allocation) and their relationships as rendered by Prisma Studio.

---

### Scalability Considerations

**Current Design Supports:**

- 100+ NGOs with 1000s of inventory records
- Complex allocation workflows with audit trails
- Sub-second queries on indexed columns
- Batch operations via Prisma

**Future Optimizations:**

- Redis caching for dashboard aggregations
- Materialized views for complex reports
- Partitioning allocations by date (time-series data)
- Archive old allocations to separate table

---

### Reflections & Lessons

**Strengths:**
- Normalized design prevents data anomalies
- Composite keys in `Inventory` prevent duplicates elegantly
- Enum types catch invalid values at compile-time (TypeScript)
- Appropriate cascading rules maintain referential integrity
- Strategic indexes support all common query patterns

**Future Work:**
- Add audit tables to track all CREATE/UPDATE/DELETE operations
- Implement row-level security (RLS) for multi-tenant isolation
- Add triggers for automatic timestamp updates
- Create views for aggregations (e.g., total items per category)

---

### Viewing the Schema

**Interactive Exploration:**
```bash
npx prisma studio
# Opens http://localhost:5555 for visual schema browsing
```

**View Generated SQL:**
```bash
cat prisma/migrations/20260128060658_init_schema/migration.sql
```

