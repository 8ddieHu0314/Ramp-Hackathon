'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, X } from 'lucide-react'
import type { Role } from '@/lib/types'

interface RoleEmailSectionProps {
  role: Role
  emails: string[]
  onChange: (emails: string[]) => void
}

export function RoleEmailSection({ role, emails, onChange }: RoleEmailSectionProps) {
  const addEmail = () => onChange([...emails, ''])

  const removeEmail = (i: number) => {
    if (emails.length <= 1) return
    onChange(emails.filter((_, idx) => idx !== i))
  }

  const updateEmail = (i: number, value: string) => {
    const next = [...emails]
    next[i] = value
    onChange(next)
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-foreground">{role}</p>
      {emails.map((email, i) => (
        <div key={i} className="flex gap-2">
          <Input
            type="email"
            placeholder="colleague@company.com"
            value={email}
            onChange={(e) => updateEmail(i, e.target.value)}
            className="flex-1"
          />
          {emails.length > 1 && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeEmail(i)}
              className="shrink-0 text-muted-foreground hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={addEmail}
        className="text-xs text-muted-foreground hover:text-foreground"
      >
        <Plus className="mr-1 h-3 w-3" />
        Add email
      </Button>
    </div>
  )
}
