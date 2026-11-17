# Purple — Employee Support Application

Mivali Purple is a React and TypeScript employee support application.

## Features

- Employee support requests and request history.
- Follow-up communication.
- Independent support requests.
- Retaliation support linked to original cases.
- Internal support workspace.
- Employee-facing request status and progress.

## Technology

- React and TypeScript
- Vite
- React Router
- Lucide React
- Vitest and Testing Library
- Oxlint

## Requirements

- Node.js
- npm

## Installation

Clone the repository, navigate into the project directory, and install dependencies:

    git clone <repository-url>
    cd PURPLE
    npm install

## Development

    npm run dev

Open **http://localhost:5173/** and sign in with a role-specific account.

| Role | Email | Password |
|------|---------|----------|
| Employee | `naledi@youngtech.local` | `demo` |
| Internal Support | `coordinator@youngtech.local` | `demo` |
| Administration | `admin@youngtech.local` | `demo` |

Each role has its own login and workspace. Employee requests still appear in Internal Support case work and in the Administration overview.

## Production Build

    npm run build

## Tests and Linting

    npm run test:run
    npm run lint

## Production Preview

    npm run preview

## Project Structure

- `public/` — public images and assets.
- `src/pages/employee/` — employee-facing pages.
- `src/pages/internal-support/` — internal support workspace.
- `src/data/` — support request data and operations.
- `src/types/` — TypeScript definitions.
- `src/styles/` — application styling.
- `src/test/` — test setup.

## Prototype Limitations

This is a development prototype. Application data is currently managed client-side. A production backend, durable database persistence, and real authentication and authorization have not been established by this frontend alone.

Do not use this prototype to store real confidential employee information until appropriate production security and data-protection safeguards are implemented.

## Version History

The Git repository retains the application's development history.
