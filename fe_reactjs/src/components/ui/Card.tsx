import React from 'react'
import { clsx } from 'clsx'

interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: 'sm' | 'md' | 'lg'
}

export function Card({ children, className, padding = 'md' }: CardProps) {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  }

  return (
    <div
      className={clsx(
        'bg-white rounded-xl shadow-lg border border-gray-100',
        paddingClasses[padding],
        className
      )}
    >
      {children}
    </div>
  )
}
