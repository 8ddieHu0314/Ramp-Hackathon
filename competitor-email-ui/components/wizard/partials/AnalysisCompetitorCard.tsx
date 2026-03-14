import type { CompetitorAnalysis, Role } from '@/lib/types'

const roleBadgeColor: Record<Role, string> = {
  'Marketing/PMs': 'bg-purple-100 text-purple-800 border-purple-200',
  'SWEs': 'bg-blue-100 text-blue-800 border-blue-200',
  'Sales': 'bg-green-100 text-green-800 border-green-200',
  'HR': 'bg-orange-100 text-orange-800 border-orange-200',
}

interface AnalysisCompetitorCardProps {
  analysis: CompetitorAnalysis
}

export function AnalysisCompetitorCard({ analysis }: AnalysisCompetitorCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="font-semibold text-foreground">{analysis.competitorName}</h3>
        <span
          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${roleBadgeColor[analysis.role]}`}
        >
          {analysis.role}
        </span>
      </div>

      <div className="space-y-3">
        <Section label="Sales Strategy" text={analysis.salesStrategy} />
        <Section label="Marketing Strategy" text={analysis.marketingStrategy} />
        <Section label="Infrastructure" text={analysis.infrastructure} />
      </div>
    </div>
  )
}

function Section({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
      <p className="text-sm text-foreground leading-relaxed">{text}</p>
    </div>
  )
}
