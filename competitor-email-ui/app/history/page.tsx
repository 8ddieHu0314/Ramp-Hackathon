import { PLACEHOLDER_HISTORY_RUNS } from '@/lib/placeholder-data'
import { HistoryCard } from '@/components/history/HistoryCard'
import { Button } from '@/components/ui/button'

export default function HistoryPage() {
  const sortedRuns = [...PLACEHOLDER_HISTORY_RUNS].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">History</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review your previous wizard submissions and configurations.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {sortedRuns.map((run) => (
          <HistoryCard key={run.id} run={run} />
        ))}
      </div>

      <div className="flex justify-center pt-2">
        <Button variant="outline" disabled>
          Load more
        </Button>
      </div>
    </div>
  )
}
