import type {
  DashboardRun,
  HistoryRun,
  AnalysisResult,
} from './types'

export const PLACEHOLDER_ANALYSIS_RESULT: AnalysisResult = {
  coreDiscoveries: [
    {
      id: 'cd1',
      title: 'Competitors doubling down on enterprise sales motion',
      detail:
        'Acme Corp and TechRival both hired VP-level enterprise sales leaders in Q1 2026, signaling a major shift toward upmarket deals over self-serve growth.',
    },
    {
      id: 'cd2',
      title: 'AI-powered onboarding gaining traction',
      detail:
        'Three of your six tracked competitors launched guided AI onboarding flows, reducing time-to-value by a reported 40% and cutting support tickets in early trials.',
    },
    {
      id: 'cd3',
      title: 'Pricing transparency as a differentiator',
      detail:
        'Two competitors recently published public pricing pages, correlating with a measurable uptick in organic inbound leads based on community forum mentions.',
    },
    {
      id: 'cd4',
      title: 'Infrastructure investment in multi-region deployments',
      detail:
        'TechRival announced EMEA and APAC data residency options — a direct response to enterprise compliance requirements that could unlock large regulated-industry deals.',
    },
  ],
  competitorAnalyses: [
    // Acme Corp
    {
      competitorId: 'c1',
      competitorName: 'Acme Corp',
      role: 'Marketing/PMs',
      salesStrategy:
        'Acme is running a heavy ABM motion targeting Fortune 500 procurement teams, with custom landing pages per account and dedicated SDR sequences.',
      marketingStrategy:
        'Their blog output doubled this quarter with a focus on "platform" messaging; they sponsor 3 major industry newsletters and run monthly analyst briefings.',
      infrastructure:
        'Acme recently open-sourced a companion CLI tool to attract developer mindshare while keeping the core product proprietary.',
    },
    {
      competitorId: 'c1',
      competitorName: 'Acme Corp',
      role: 'SWEs',
      salesStrategy:
        'Developer-led growth: free tier with usage-based upsell. SDRs engage only after a usage threshold is hit in the self-serve product.',
      marketingStrategy:
        'Heavy investment in documentation, open-source tooling, and a public roadmap to build community trust.',
      infrastructure:
        'Kubernetes-native deployment on AWS; they recently achieved SOC 2 Type II and are pursuing FedRAMP authorization.',
    },
    {
      competitorId: 'c1',
      competitorName: 'Acme Corp',
      role: 'Sales',
      salesStrategy:
        'Multi-threading deals across champion, economic buyer, and IT security. Average deal cycle is 90 days for mid-market.',
      marketingStrategy:
        'ROI calculators and case studies are gated behind a demo request flow to qualify leads before handoff to AEs.',
      infrastructure:
        'Integrations with Salesforce, HubSpot, and Outreach for full funnel attribution — likely a selling point to revenue ops stakeholders.',
    },
    {
      competitorId: 'c1',
      competitorName: 'Acme Corp',
      role: 'HR',
      salesStrategy:
        'Targeting HR/People ops buyers with HRIS integrations. Positioning as a "people analytics" platform to expand beyond core use case.',
      marketingStrategy:
        'Sponsoring HR tech conferences; their CMO recently spoke at HR Tech World on AI in workforce planning.',
      infrastructure:
        'GDPR and CCPA compliance prominently featured on their security page, directly addressing HR data concerns.',
    },
    // TechRival
    {
      competitorId: 'c2',
      competitorName: 'TechRival',
      role: 'Marketing/PMs',
      salesStrategy:
        'Product-qualified leads flow directly to a CS team that drives expansion; new logo acquisition is secondary to land-and-expand.',
      marketingStrategy:
        'TechRival publishes a quarterly "State of the Industry" report that consistently earns backlinks and media coverage — a strong top-of-funnel asset.',
      infrastructure:
        'They launched a native Figma integration last month, signaling a push into design-adjacent workflows for PMs.',
    },
    {
      competitorId: 'c2',
      competitorName: 'TechRival',
      role: 'SWEs',
      salesStrategy:
        'Open-core model: free community edition drives adoption; paid tiers unlock SSO, audit logs, and priority support.',
      marketingStrategy:
        'Active on Hacker News and Reddit; their CTO writes long-form technical posts that regularly trend on dev communities.',
      infrastructure:
        'Multi-region support just launched (US, EU, APAC). GraphQL API with comprehensive SDKs in Python, Go, and TypeScript.',
    },
    {
      competitorId: 'c2',
      competitorName: 'TechRival',
      role: 'Sales',
      salesStrategy:
        'Commission structure rewards multi-year deals; reps are incentivized to push annual contracts over monthly.',
      marketingStrategy:
        'Heavy use of G2 reviews and Gartner Peer Insights — they actively solicit customer reviews after renewal.',
      infrastructure:
        'Native CRM integrations across Salesforce, Pipedrive, and Zoho; custom webhook support for bespoke sales tech stacks.',
    },
    {
      competitorId: 'c2',
      competitorName: 'TechRival',
      role: 'HR',
      salesStrategy:
        'Pitching compliance automation to HR directors; strong play in regulated industries (finance, healthcare).',
      marketingStrategy:
        'Webinar series on "Future of Work" topics generates consistent MQLs from HR personas.',
      infrastructure:
        'SSO via Okta and Azure AD, SCIM provisioning — table-stakes for enterprise HR teams with large headcounts.',
    },
  ],
}

export const PLACEHOLDER_DASHBOARD_RUNS: DashboardRun[] = [
  {
    id: 'run-1',
    date: '2026-03-14',
    companyName: 'Acme Corp',
    jobStatus: 'running',
    statusMessages: [
      'Fetching competitor websites…',
      'Analyzing marketing strategies…',
      'Identifying product differentiators…',
      'Crafting role-targeted insights…',
      'Generating email drafts…',
    ],
    emailsByRole: [],
  },
  {
    id: 'run-2',
    date: '2026-03-13',
    companyName: 'Acme Corp',
    jobStatus: 'complete',
    statusMessages: ['Analysis complete.'],
    emailsByRole: [
      {
        role: 'Marketing/PMs',
        subject: "Your competitors' Q1 product moves — what you need to know",
        body: `Hi [Marketing/PM Team],

Here's your daily competitor brief for March 13, 2026.

🔍 KEY FINDING
TechRival launched a Figma integration yesterday — a direct move into the design-to-product workflow that your PMs live in. Expect them to use this as a wedge in deals where design teams influence tool decisions.

📣 MARKETING WATCH
Acme Corp published their quarterly benchmark report this morning. It's already picked up coverage on Product Hunt and several industry newsletters. Consider whether a counter-narrative (or your own data report) makes sense to accelerate.

💡 SUGGESTED ACTIONS
• Brief your PM team on TechRival's Figma integration before customer calls this week
• Monitor social for customer reactions to Acme's benchmark claims
• Flag any deals where design-team stakeholders are involved for adjusted messaging

Stay sharp,
Your Competitor Intelligence Agent`,
      },
      {
        role: 'Sales',
        subject: "Competitor deal tactics to prep for this week's pipeline",
        body: `Hi Sales Team,

Your daily competitive intel for March 13.

🏆 WIN/LOSS SIGNALS
Acme Corp is pushing multi-year annual contracts aggressively — reps are seeing 20% discounts offered at signature. If a prospect mentions a "great offer" from Acme, that's the play. Counter with your total cost of ownership story.

📊 BATTLECARD UPDATE
TechRival added G2 review badges to their pricing page. Prompt your champions to leave reviews this week to close the review-count gap.

🎯 THIS WEEK'S FOCUS
Deals with compliance stakeholders: TechRival is pitching hard on GDPR/CCPA automation. Make sure you're leading with your compliance story first.

Close strong,
Your Competitor Intelligence Agent`,
      },
    ],
  },
  {
    id: 'run-3',
    date: '2026-03-12',
    companyName: 'Acme Corp',
    jobStatus: 'complete',
    statusMessages: ['Analysis complete.'],
    emailsByRole: [
      {
        role: 'Marketing/PMs',
        subject: 'Competitor content blitz detected — March 12 brief',
        body: `Hi [Marketing/PM Team],

March 12 digest — your competitors had an active content day.

Key movements:
• Acme published 3 blog posts (all targeting "platform" SEO keywords)
• TechRival launched a new case study hub with 12 customer stories

Recommended response: audit your own case study library and identify gaps before your next content sprint.

— Your Competitor Intelligence Agent`,
      },
      {
        role: 'SWEs',
        subject: 'March 12 — SDK updates and open-source activity recap',
        body: `Hey Engineering,

Overnight competitor dev activity:

• TechRival merged 23 PRs to their public SDK repo — mostly TypeScript improvements
• Acme's CLI tool hit 1k GitHub stars

Nothing blocking, but worth monitoring TechRival's TypeScript SDK velocity if that's a language your team cares about.

— Your Competitor Intelligence Agent`,
      },
    ],
  },
]

export const PLACEHOLDER_HISTORY_RUNS: HistoryRun[] = [
  {
    id: 'hist-1',
    date: '2026-03-14',
    companyName: 'Acme Corp',
    companyDescription:
      'B2B SaaS platform helping operations teams streamline workflows and reduce manual overhead across finance and HR.',
    selectedRoles: ['Marketing/PMs', 'SWEs', 'Sales', 'HR'],
    competitors: [
      { name: 'TechRival', website: 'https://techrival.com' },
      { name: 'OpsCo', website: 'https://opsco.io' },
      { name: 'FlowBase', website: 'https://flowbase.com' },
    ],
  },
  {
    id: 'hist-2',
    date: '2026-03-07',
    companyName: 'Acme Corp',
    companyDescription:
      'B2B SaaS platform helping operations teams streamline workflows and reduce manual overhead across finance and HR.',
    selectedRoles: ['Marketing/PMs', 'Sales'],
    competitors: [
      { name: 'TechRival', website: 'https://techrival.com' },
      { name: 'OpsCo', website: 'https://opsco.io' },
    ],
  },
  {
    id: 'hist-3',
    date: '2026-02-28',
    companyName: 'Acme Corp',
    companyDescription: '',
    selectedRoles: ['SWEs', 'HR'],
    competitors: [
      { name: 'TechRival', website: 'https://techrival.com' },
      { name: 'FlowBase', website: 'https://flowbase.com' },
      { name: 'Nexaflow', website: 'https://nexaflow.dev' },
      { name: 'PivotAI', website: 'https://pivotai.co' },
    ],
  },
  {
    id: 'hist-4',
    date: '2026-02-21',
    companyName: 'Acme Corp',
    companyDescription:
      'B2B SaaS platform for operations automation.',
    selectedRoles: ['Marketing/PMs', 'SWEs', 'Sales'],
    competitors: [
      { name: 'TechRival', website: 'https://techrival.com' },
    ],
  },
]
