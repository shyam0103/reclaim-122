import { Status } from '../types'
import { STATUS_DOT_CLASS } from '../lib/statusUi'
import clsx from 'clsx'
import { useNavigate } from 'react-router-dom'

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export function MonthCalendar({
  year,
  month, // 1-12
  monthDates,
  statusByDate,
  today,
  onSelectDate
}: {
  year: number
  month: number
  monthDates: string[]
  statusByDate: Map<string, Status>
  today: string
  onSelectDate?: (date: string) => void
}) {
  const navigate = useNavigate()
  const firstWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay()
  const leadingBlanks = Array.from({ length: firstWeekday })

  function handleClick(date: string) {
    if (onSelectDate) onSelectDate(date)
    else navigate(`/today?date=${date}`)
  }

  return (
    <div>
      <div className="grid grid-cols-7 gap-y-1 mb-1">
        {WEEKDAYS.map((w, i) => (
          <div key={i} className="text-center text-[11px] font-medium text-muted dark:text-muted-dark">
            {w}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1.5">
        {leadingBlanks.map((_, i) => (
          <div key={`b${i}`} />
        ))}
        {monthDates.map((date) => {
          const status = statusByDate.get(date) ?? 'not_recorded'
          const isFuture = date > today
          const dayNum = Number(date.slice(-2))
          const isToday = date === today

          return (
            <button
              key={date}
              onClick={() => handleClick(date)}
              disabled={isFuture}
              className={clsx(
                'aspect-square mx-auto w-full max-w-9 rounded-full flex items-center justify-center text-[13px] relative',
                isFuture
                  ? 'text-line dark:text-line-dark cursor-default'
                  : 'text-ink dark:text-ink-dark active:scale-90 transition-transform'
              )}
            >
              {!isFuture && status !== 'not_recorded' && (
                <span className={clsx('absolute inset-0 rounded-full opacity-90', STATUS_DOT_CLASS[status])} />
              )}
              <span
                className={clsx(
                  'relative z-10',
                  !isFuture && status !== 'not_recorded' && 'text-white font-medium',
                  isToday && 'underline underline-offset-4'
                )}
              >
                {dayNum}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
