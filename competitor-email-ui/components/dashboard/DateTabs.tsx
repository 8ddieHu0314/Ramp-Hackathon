'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RoleSubtabs } from './RoleSubtabs'
import { StatusArea } from './StatusArea'
import type { DashboardRun } from '@/lib/types'

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

interface DateTabsProps {
  runs: DashboardRun[]
}

export function DateTabs({ runs }: DateTabsProps) {
  if (runs.length === 0) {
    return (
      <div className="py-16 text-center text-sm text-muted-foreground">
        No runs yet. Complete the wizard to get started.
      </div>
    )
  }

  return (
    <Tabs defaultValue={runs[0].id}>
      <div className="overflow-x-auto pb-2">
        <TabsList className="inline-flex h-auto gap-1 bg-transparent p-0 min-w-max">
          {runs.map((run) => (
            <TabsTrigger
              key={run.id}
              value={run.id}
              className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:bg-primary/5 data-[state=active]:text-foreground data-[state=active]:shadow-none"
            >
              {formatDate(run.date)}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      {runs.map((run) => (
        <TabsContent key={run.id} value={run.id} className="mt-6 space-y-6">
          <StatusArea status={run.jobStatus} messages={run.statusMessages} />
          <RoleSubtabs emails={run.emailsByRole} />
        </TabsContent>
      ))}
    </Tabs>
  )
}
