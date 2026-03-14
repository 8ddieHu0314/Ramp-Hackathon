import { PLACEHOLDER_DASHBOARD_RUNS } from '@/lib/placeholder-data'
import { DateTabs } from '@/components/dashboard/DateTabs'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Monitor your daily competitor intelligence runs and review generated emails.
        </p>
      </div>
      <DateTabs runs={PLACEHOLDER_DASHBOARD_RUNS} />
    </div>
  )
}
