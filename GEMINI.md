# Project Rules & Guidelines (AnalyzeSERP)

## 1. Safety & Reversion Policy (Strict)
- **NEVER revert, undo, or delete any previous code changes, features, routes, or components unilaterally.**
- Before reverting any code or removing any existing feature (e.g. `/audit`, components, buttons), **ALWAYS ask for explicit confirmation from the user first**.
- If the user mentions a revert or adjustment, clarify their exact intent before touching or removing files.

## 2. Technical & Development Constraints
- **Dedicated Audit Route**: Retain `/audit` (`src/app/audit/page.tsx` and `src/app/audit/layout.tsx`) with breadcrumb actions (`Edit URLs`, `New Audit`).
- **Build / Run Commands**: NEVER run `npm run dev`, `next dev`, `npm run build`, or `next build` directly in the shell.
- **Type Checking**: Always verify with `node --max-old-space-size=2048 ./node_modules/typescript/bin/tsc --noEmit`.
- **UI Guidelines**: Anti-glare typography (`text-slate-800 dark:text-slate-100`), Lucide icons only (zero emojis), compact buttons (`px-2.5 py-1.5 rounded-lg text-xs font-medium`).
