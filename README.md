# NLAMS Vajracore

NLAMS Vajracore is a role-based land management and agricultural services platform built for coordinated government, field, and landholder workflows. The application gives each user type a focused dashboard for reviewing proposals, completing field surveys, and managing land records through a consistent, accessible interface.

## Features

- Role-aware dashboards for State Monitors, District Officers, Field Officers, and Landholders
- Proposal review and submission workflows
- Field survey checklists and verification tools
- Land parcel overview and status tracking
- Shared responsive navigation with collapsible sidebar support
- Route-specific dashboard views with role-aware labels and actions
- Dark, high-contrast interface optimized for operational use

## Application Routes

- `/dashboard` — role-based overview dashboard
- `/workbench` — proposal review workbench
- `/submit-proposal` — proposal submission workflow
- `/field-survey` — field verification and survey checklist
- `/my-land` — landholder parcel dashboard

## Technology

- [Next.js](https://nextjs.org) with the App Router
- [React](https://react.dev)
- [TypeScript](https://www.typescriptlang.org)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [Lucide](https://lucide.dev) icons

## Getting Started

### Prerequisites

- Node.js 18.18 or newer
- npm, pnpm, yarn, or another compatible package manager

### Installation

```bash
npm install
```

### Development

Start the local development server:

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

### Production build

```bash
npm run build
npm run start
```

## Project Structure

```text
app/                 Next.js routes and layouts
components/          Reusable application and UI components
public/              Static assets
```

## Development Notes

The primary application shell lives in `components/nlams-app.tsx`. Route pages compose the shared shell while providing the appropriate role, navigation context, and dashboard content for each workflow.

This project is connected to [v0](https://v0.app), so the interface can be iterated from the linked v0 project and synchronized with the connected GitHub repository.

## License

This project is maintained for the NLAMS Vajracore application. Add the appropriate license before distributing the code publicly.
