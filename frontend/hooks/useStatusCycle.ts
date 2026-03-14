'use client'

import { useState, useEffect } from 'react'

export function useStatusCycle(messages: string[], intervalMs = 2500): string {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (messages.length <= 1) return
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % messages.length)
    }, intervalMs)
    return () => clearInterval(id)
  }, [messages, intervalMs])

  return messages[index] ?? ''
}
