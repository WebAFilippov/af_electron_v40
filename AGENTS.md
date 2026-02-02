# AGENTS.md - Coding Guidelines for af_electron

This file provides guidance for AI agents working in this Electron application codebase.

## Project Overview

An Electron application with React 19, TypeScript, Effector state management, and shadcn/ui components.
Uses Feature-Sliced Design (FSD) architecture with separate main, preload, and renderer processes.

## Build Commands

```bash
# Development
npm run dev              # Start development mode
npm run dev:w            # Start with watch mode

# Production build
npm run build            # Build all (includes typecheck)
npm run build:unpack     # Build and unpack (no installer)
npm run build:win        # Build Windows installer
npm run build:publish    # Build and publish to update server

# Code quality
npm run lint             # Run ESLint with caching
npm run format           # Run Prettier on all files
npm run typecheck        # Type check both node and web
npm run typecheck:node   # Type check main/preload only
npm run typecheck:web    # Type check renderer only
```

## Test Commands

```bash
# Run tests
npm run vitest                    # Run vitest in watch mode
npx vitest run                    # Run tests once
npx vitest run --reporter=verbose # Run with verbose output

# Run single test file
npx vitest run src/path/to/file.test.ts

# Run tests matching pattern
npx vitest run --testNamePattern="test name"
npx vitest run -t "describe block name"
```

## Code Style Guidelines

### Formatting (Prettier)

- Single quotes, no semicolons
- Print width: 120 characters
- Tab width: 2 spaces (no tabs)
- No trailing commas
- End of line: auto

### TypeScript

- Strict type checking enabled
- Use `type` over `interface` for simple type aliases
- React components: Use `ReactNode` return type
- Avoid `any` - use proper types (eslint rule: `@typescript-eslint/no-explicit-any: false`)
- Path aliases required (see below)

### Import Order

1. External libraries (React, Electron, etc.)
2. Internal path aliases (`@/entities`, `@/shared`, etc.)
3. Relative imports (avoid when possible)
4. Type-only imports: Use `import type { ... }`

### Naming Conventions

**Files:**

- Components: PascalCase (`Button.tsx`, `HomePage.tsx`)
- Utilities/Hooks: camelCase (`useUnit.ts`, `utils.ts`)
- Constants: UPPER_SNAKE_CASE for exported constants

**Variables:**

- Stores (Effector): Prefix with `$` (`$versionApp`, `$updateData`)
- Events: camelCase (`setVersionApp`, `checkForUpdateFx`)
- Effects: Suffix with `Fx` (`retryDownloadFx`, `checkForUpdateFx`)
- Components: PascalCase (`HomePage`, `UpdatePanel`)
- React hooks: Prefix with `use` (`useUnit`, `useMobile`)

### Architecture (Feature-Sliced Design)

**Renderer process layers:**

- `@/app` - App initialization, routing, layouts
- `@/pages` - Page components (route-level)
- `@/widgets` - Complex UI blocks (sidebar, panels)
- `@/features` - User interactions (not used yet)
- `@/entities` - Business entities with model/ui
- `@/shared` - Reusable UI components, utils, hooks

**Main process layers:**

- `@/app` - Window/tray creation
- `@/ipc` - IPC handlers registration
- `@/modules` - Feature modules (settings, theme, etc.)
- `@/shared` - Shared utilities

### State Management (Effector)

- Use `createEvent`, `createEffect`, `createStore` (or `restore`)
- Use `sample` for connecting logic
- Export stores with `$` prefix from model files
- Place models in `entities/[name]/model/`

### Error Handling

- Use `toast` from `sonner` for user-facing errors
- Throw descriptive errors in effects
- Handle errors with `.failData` in samples
- Log errors using pino logger in main process

### Component Patterns

- Use function declarations for components
- Destructure props in parameters
- Use `cn()` utility for Tailwind class merging
- Export components from `ui/index.ts`
- Use React 19 features (no need to import React)

### CSS/Tailwind

- Use Tailwind v4 with CSS variables
- Global styles: `src/renderer/src/app/styles/globals.css`
- Component variants: Use `class-variance-authority` (cva)
- Icon library: Hugeicons (via `@hugeicons/react`)

### Electron-Specific

- Main process: Use ES modules (type: "module")
- IPC: Define types in `src/preload/[feature]/types.ts`
- Expose APIs via `contextBridge` in preload
- Never use `nodeIntegration: true`

## File Structure

```
src/
├── main/           # Electron main process
│   ├── app/        # Window/tray creation
│   ├── ipc/        # IPC handlers
│   ├── modules/    # Feature modules
│   └── shared/     # Shared utils
├── preload/        # Preload scripts
│   └── [feature]/  # Feature-based preloads
├── renderer/       # React frontend
│   └── src/
│       ├── app/    # Routing, layouts
│       ├── pages/  # Route pages
│       ├── widgets/# Complex components
│       ├── entities/# Business logic
│       └── shared/ # UI components, utils
└── shared/         # Shared between processes
```

## Key Libraries

- **UI**: shadcn/ui, Radix UI, Tailwind CSS v4
- **State**: Effector, patronum
- **Forms**: react-hook-form, zod
- **Routing**: react-router v7
- **i18n**: i18next, react-i18next
- **Logging**: pino (main), electron-log (renderer)
