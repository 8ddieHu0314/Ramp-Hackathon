'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EmailDisplay } from './EmailDisplay'
import type { GeneratedEmail, Role } from '@/lib/types'

const roleBadgeColor: Record<Role, string> = {
  'Marketing/PMs': 'data-[state=active]:text-purple-700',
  'SWEs': 'data-[state=active]:text-blue-700',
  'Sales': 'data-[state=active]:text-green-700',
  'HR': 'data-[state=active]:text-orange-700',
}

interface RoleSubtabsProps {
  emails: GeneratedEmail[]
}

export function RoleSubtabs({ emails }: RoleSubtabsProps) {
  if (emails.length === 0) {
    return (
      <div className="py-10 text-center text-sm text-muted-foreground">
        Emails are being generated — check back soon.
      </div>
    )
  }

  return (
    <Tabs defaultValue={emails[0].role} orientation="vertical">
      <TabsList className="h-auto w-36 shrink-0 flex-col gap-1 bg-transparent p-0 items-stretch">
        {emails.map((e) => (
          <TabsTrigger
            key={e.role}
            value={e.role}
            className={`justify-start rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:bg-primary/5 data-[state=active]:shadow-none ${roleBadgeColor[e.role]}`}
          >
            {e.role}
          </TabsTrigger>
        ))}
      </TabsList>
      {emails.map((e) => (
        <TabsContent key={e.role} value={e.role} className="mt-0 flex-1">
          <EmailDisplay email={e} />
        </TabsContent>
      ))}
    </Tabs>
  )
}
