'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Copy, Check } from 'lucide-react'
import type { GeneratedEmail } from '@/lib/types'

interface EmailDisplayProps {
  email: GeneratedEmail
}

export function EmailDisplay({ email }: EmailDisplayProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(`Subject: ${email.subject}\n\n${email.body}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1 flex-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Subject</p>
          <p className="text-sm font-medium text-foreground">{email.subject}</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleCopy} className="shrink-0">
          {copied ? (
            <>
              <Check className="mr-1.5 h-3.5 w-3.5 text-green-500" />
              Copied
            </>
          ) : (
            <>
              <Copy className="mr-1.5 h-3.5 w-3.5" />
              Copy
            </>
          )}
        </Button>
      </div>

      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Body</p>
        <div className="rounded-md border border-border bg-muted/30 p-4">
          <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{email.body}</p>
        </div>
      </div>
    </div>
  )
}
