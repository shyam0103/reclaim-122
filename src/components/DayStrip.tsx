import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import { Status } from '../types'
import { STATUS_DOT_CLASS } from '../lib/statusUi'

const WEEKDAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

/** Horizontally swipeable strip of every mission day (past + future), auto-scrolled
 * to today. Lets the user glance back/forward without opening the full calendar. */
export function DayStrip({
  dates,
  statusByDate,
  today
}: {
  dates: string[]
  statusByDate: Map<string, Status>
  today: string
}) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const todayRef = useRef<HTMLButtonElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    todayRef.current?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'auto' })
  }, [])

  return (
    <div
      ref={scrollerRef}
      className="flex gap-2 overflow-x-auto pb-1 -mx-5 px-5 snap-x snap-mandatory scrollbar-none"
      style={{ scrollbarWidth: 'none' }}
    >
      {dates.map((date) => {
        const status = statusByDate.get(date) ?? 'not_recorded'
        const isFuture = date > today
        const isToday = date === today
        const d = new Date(`${date}T12:00:00Z`)
        const dayNum = d.getUTCDate()
        const weekday = WEEKDAY_LETTERS[d.getUTCDay()]

        return (
          <button
            key={date}
            ref={isToday ? todayRef : undefined}
            disabled={isFuture}
            onClick={() => navigate(`/today?date=${date}`)}
            className={clsx(
              'shrink-0 snap-center flex flex-col items-center gap-1.5 w-11 py-2 rounded-2xl transition-transform active:scale-90',
              isToday && 'bg-line/50 dark:bg-line-dark/50'
            )}
          >
            <span className="text-[10px] font-medium text-muted dark:text-muted-dark">{weekday}</span>
            <span
              className={clsx(
                'w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-medium',
                isFuture
                  ? 'text-line dark:text-line-dark'
                  : status === 'not_recorded'
                  ? 'text-ink dark:text-ink-dark border border-line dark:border-line-dark'
                  : clsx('text-white', STATUS_DOT_CLASS[status])
              )}
            >
              {dayNum}
            </span>
            {isToday && <span className="w-1 h-1 rounded-full bg-status-blue" />}
          </button>
        )
      })}
    </div>
  )
}
