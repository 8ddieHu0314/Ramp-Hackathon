import type { HistoryRun, Role } from '@/lib/types'

const roleBadgeColor: Record<Role, string> = {
  'Marketing/PMs': 'bg-purple-100 text-purple-800 border-purple-200',
  'SWEs': 'bg-blue-100 text-blue-800 border-blue-200',
  'Sales': 'bg-green-100 text-green-800 border-green-200',
  'HR': 'bg-orange-100 text-orange-800 border-orange-200',
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

interface HistoryCardProps {
  run: HistoryRun
}

export function HistoryCard({ run }: HistoryCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-5 space-y-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="font-semibold text-foreground">{run.companyName}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{formatDate(run.date)}</p>
        </div>
      </div>

      {run.companyDescription && (
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{run.companyDescription}</p>
      )}

      {/* Role badges */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Roles</p>
        <div className="flex flex-wrap gap-1.5">
          {run.selectedRoles.map((role) => (
            <span
              key={role}
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${roleBadgeColor[role]}`}
            >
              {role}
            </span>
          ))}
        </div>
      </div>

      {/* Competitor pills */}
      {run.competitors.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Competitors</p>
          <div className="flex flex-wrap gap-1.5">
            {run.competitors.map((c) => (
              <span
                key={c.name}
                className="inline-flex items-center rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground"
              >
                {c.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
