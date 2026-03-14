Competitor Email Agent — UI Plan

Context

Build a frontend UI for a competitor email agent that sends daily role-targeted emails. Another developer handles the backend.
All data is placeholder/mock. Stack: Vite + React 19, TypeScript. UI library and routing TBD (shadcn/ui + Tailwind + React Router recommended).

---
Current State

The project is a bare Vite + React scaffold (default template). None of the planned components, pages, state management, or UI libraries have been implemented yet.

Installed dependencies:
- react@^19.2.4
- react-dom@^19.2.4
- vite@^8.0.0
- typescript@~5.9.3

Not yet installed (recommended):
- React Router (routing)
- Tailwind CSS (styling)
- shadcn/ui (component library)
- Framer Motion (step transitions)

---
Planned File Structure

src/
  App.tsx                    # Root with router setup
  main.tsx                   # Entry point

  pages/
    WizardPage.tsx           # Mounts WizardContextProvider + WizardShell
    DashboardPage.tsx        # Dashboard (status + email history tabs)
    HistoryPage.tsx          # Previous inputs view

  components/
    layout/
      Navbar.tsx             # Top nav: Wizard | Dashboard | History links
    wizard/
      WizardStepper.tsx      # Horizontal step indicator (numbered circles + lines)
      WizardShell.tsx        # Step renderer + transitions + Back/Next buttons
      steps/
        Step1CompanySetup.tsx      # Company name, website, optional description
        Step2RolesAndEmails.tsx    # Role toggles + per-role email inputs + additional focus
        Step3Competitors.tsx       # Up to 6 competitor cards (name + URL)
        Step4AnalysisResults.tsx   # Core discoveries + competitor x role analysis grid
      partials/
        RoleEmailSection.tsx       # Per-role email input list with add/remove
        CompetitorCard.tsx         # Single competitor input card with remove button
        AnalysisCompetitorCard.tsx # Competitor x role analysis card
    dashboard/
      StatusArea.tsx         # Animated cycling status messages + spinner/checkmark
      DateTabs.tsx           # Outer tabs labeled by date (most recent default)
      RoleSubtabs.tsx        # Inner tabs per role within a date
      EmailDisplay.tsx       # Subject + body with copy button
    history/
      HistoryCard.tsx        # Read-only card: company, roles, competitors, date

  lib/
    types.ts                 # All TypeScript interfaces
    placeholder-data.ts      # All mock data
    wizard-context.tsx       # WizardContext + WizardContextProvider

  hooks/
    useStatusCycle.ts        # Cycles through status messages on interval

---
Key Types (lib/types.ts)

export type Role = 'Marketing/PMs' | 'SWEs' | 'Sales' | 'HR'
export const ROLES: Role[] = ['Marketing/PMs', 'SWEs', 'Sales', 'HR']

export interface CompetitorInput { id: string; name: string; website: string }
export interface RoleEmails { role: Role; emails: string[] }
export interface WizardFormData {
  companyName: string; companyWebsite: string; companyDescription: string
  selectedRoles: Role[]; roleEmails: RoleEmails[]
  additionalFocus: string; competitors: CompetitorInput[]
}
export interface CompetitorAnalysis {
  competitorId: string; competitorName: string; role: Role
  salesStrategy: string; marketingStrategy: string; infrastructure: string
}
export interface CoreDiscovery { id: string; title: string; detail: string }
export interface AnalysisResult { coreDiscoveries: CoreDiscovery[]; competitorAnalyses: CompetitorAnalysis[] }
export interface GeneratedEmail { role: Role; subject: string; body: string }
export interface DashboardRun {
  id: string; date: string; companyName: string
  jobStatus: 'running' | 'complete' | 'error'
  statusMessages: string[]; emailsByRole: GeneratedEmail[]
}
export interface HistoryRun {
  id: string; date: string; companyName: string; companyDescription: string
  selectedRoles: Role[]; competitors: Pick<CompetitorInput, 'name' | 'website'>[]
}

---
State Management

- Wizard: React Context (WizardContextProvider) — holds WizardFormData, currentStep, direction, nextStep, prevStep, updateFormData
- Dashboard: Local useState for active tab + isRunning simulation
- History: No state — purely reads from placeholder-data.ts
- Status cycling: useStatusCycle(messages, intervalMs) hook → returns currentMessage

---
Page-by-Page Details

Step 1 — Company Setup

- Hero headline + tagline (hardcoded)
- Input for company name + website (required)
- Textarea for description (optional)
- Next disabled until name + website filled

Step 2 — Roles & Emails

- Toggle buttons or checkboxes for 4 roles
- Per selected role: RoleEmailSection with dynamic add/remove email fields (min 1)
- Toggling a role OFF preserves its email data in context (restores if re-enabled)
- Optional textarea: "additional info for the agent"

Step 3 — Competitors

- Up to 6 CompetitorCards (name + URL inputs + remove button)
- "Add Competitor" button — disabled + tooltip at 6
- Counter: "X / 6 competitors added"
- Animate cards in (fade+scale) and out on remove

Step 4 — Analysis Results

- "Core Discoveries" section (list of placeholder discovery cards)
- Grid (2-col desktop, 1-col mobile) of AnalysisCompetitorCards grouped by competitor
- Each card: competitor name header + role badge + Sales Strategy / Marketing Strategy / Infrastructure sections (all placeholder text)
- CTA button: "Go to Dashboard" → navigates to /dashboard

Dashboard

- Top: StatusArea — cycles status messages every 2.5s with fade animation, spinner when running, green checkmark when complete
- Bottom: DateTabs — most recent selected by default, horizontal scroll if >4 tabs
  - Inside each date tab: RoleSubtabs → EmailDisplay
  - Email display: Subject field + body (whitespace-pre-wrap) + copy-to-clipboard button

History

- Grid of HistoryCards sorted newest-first
- Each card: date, company name, description, role badges (color-coded per role), competitor pills
- Non-functional "Load more" button as placeholder

---
WizardStepper UX

- Horizontal flex row, centered container
- Completed steps: filled circle + checkmark (green)
- Current step: numbered circle with ring accent
- Future steps: muted gray
- Connecting lines fill left-to-right as steps complete (CSS width transition)

---
Step Transitions (WizardShell)

// Forward: slide left; Back: slide right
// Use Framer Motion or CSS transitions
initial: opacity 0, x offset based on direction
animate: opacity 1, x 0
exit: opacity 0, x offset opposite direction
transition duration: ~200ms
Track direction (1 or -1) in wizard context.

---
Implementation Order

1. Install dependencies (React Router, Tailwind, shadcn/ui or alternative, Framer Motion)
2. lib/types.ts
3. lib/placeholder-data.ts
4. lib/wizard-context.tsx
5. App.tsx routing setup + components/layout/Navbar.tsx
6. Wizard: WizardStepper → WizardShell → steps 1–4 + partials
7. hooks/useStatusCycle.ts + Dashboard components
8. History components

---
Verification

- Navigate through all 4 wizard steps; verify Back/Next work and data persists across steps
- Toggle roles on/off; verify email fields appear/disappear and data is preserved
- Add/remove competitors; verify 6-cap enforcement
- Visit /dashboard; verify status messages cycle, date tabs render, role subtabs open email content
- Visit /history; verify cards display mock data correctly
- Resize to 375px; verify all pages are usable on mobile
