'use client'

import { useStatusCycle } from '@/hooks/useStatusCycle'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react'

interface StatusAreaProps {
  status: 'running' | 'complete' | 'error'
  messages: string[]
}

export function StatusArea({ status, messages }: StatusAreaProps) {
  const currentMessage = useStatusCycle(status === 'running' ? messages : [messages[messages.length - 1] ?? ''], 2500)

  return (
    <div className="flex items-center gap-4 rounded-lg border border-border bg-card px-5 py-4">
      {status === 'running' && (
        <Loader2 className="h-5 w-5 shrink-0 animate-spin text-primary" />
      )}
      {status === 'complete' && (
        <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500" />
      )}
      {status === 'error' && (
        <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />
      )}

      <div className="relative h-5 flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.p
            key={currentMessage}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 text-sm text-foreground"
          >
            {currentMessage}
          </motion.p>
        </AnimatePresence>
      </div>

      <span
        className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${
          status === 'running'
            ? 'bg-blue-100 text-blue-600'
            : status === 'complete'
            ? 'bg-green-100 text-green-700'
            : 'bg-red-100 text-red-700'
        }`}
      >
        {status === 'running' ? 'Running' : status === 'complete' ? 'Complete' : 'Error'}
      </span>
    </div>
  )
}
