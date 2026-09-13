import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { MonthCalendar } from './MonthCalendar'
import { MISSION_MONTHS } from '../lib/dates'
import type { Status } from '../types'

type Props = {
  statusByDate: Map<string, Status>
  today: string
}

export function SwipeableMonthCalendar({ statusByDate, today }: Props) {
  const navigate = useNavigate()

  const todayDate = new Date(`${today}T00:00:00`)
  
  const initialIndex = Math.max(
    0,
    MISSION_MONTHS.findIndex(
      (month) =>
        month.year === todayDate.getFullYear() &&
        month.month === todayDate.getMonth() + 1
    )
  )

  const [monthIndex, setMonthIndex] = useState(initialIndex)
  const [dragStartX, setDragStartX] = useState<number | null>(null)

  const currentMonth = MISSION_MONTHS[monthIndex]

  const monthDate = useMemo(
    () =>
      new Date(
        currentMonth.year,
        currentMonth.month - 1,
        1
      ),
    [currentMonth]
  )

  function previousMonth() {
    if (monthIndex > 0) {
      setMonthIndex((value) => value - 1)
    }
  }

  function nextMonth() {
    if (monthIndex < MISSION_MONTHS.length - 1) {
      setMonthIndex((value) => value + 1)
    }
  }

  function handleTouchStart(e: React.TouchEvent) {
    setDragStartX(e.touches[0].clientX)
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (dragStartX === null) return

    const endX = e.changedTouches[0].clientX
    const difference = endX - dragStartX

    if (Math.abs(difference) >= 50) {
      if (difference < 0) {
        nextMonth()
      } else {
        previousMonth()
      }
    }

    setDragStartX(null)
  }

  function handleDateClick(date: string) {
    navigate(`/today?date=${date}`)
  }

  return (
    <div
      className="w-full"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={previousMonth}
          disabled={monthIndex === 0}
          className="p-2 rounded-full disabled:opacity-30"
          aria-label="Previous month"
        >
          <ChevronLeft size={20} />
        </button>

        <h2 className="text-base font-semibold">
          {monthDate.toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
          })}
        </h2>

        <button
          type="button"
          onClick={nextMonth}
          disabled={monthIndex === MISSION_MONTHS.length - 1}
          className="p-2 rounded-full disabled:opacity-30"
          aria-label="Next month"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <motion.div
  key={`${currentMonth.year}-${currentMonth.month}`}
  initial={{ opacity: 0, x: 20 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ duration: 0.2 }}
  className="rounded-card bg-surface dark:bg-surface-dark border border-line dark:border-line-dark p-4 shadow-sm"
>
        <MonthCalendar
  year={currentMonth.year}
  month={currentMonth.month}
  monthDates={Array.from(
    {
      length: new Date(
        currentMonth.year,
        currentMonth.month,
        0
      ).getDate(),
    },
    (_, index) => {
      const day = String(index + 1).padStart(2, '0')
      const month = String(currentMonth.month).padStart(2, '0')
      return `${currentMonth.year}-${month}-${day}`
    }
  )}
  statusByDate={statusByDate}
  today={today}
  onSelectDate={handleDateClick}
/>
      </motion.div>
    </div>
  )
}