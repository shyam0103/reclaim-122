import { ReactNode } from 'react'
import clsx from 'clsx'

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={clsx(
        'rounded-card bg-surface dark:bg-surface-dark shadow-soft dark:shadow-soft-dark p-4',
        className
      )}
    >
      {children}
    </div>
  )
}
