import { Status, StreakInfo } from '../types'
import { streakEffect } from './status'
import { todayIso } from './dates'

/**
 * Computes streak + count stats over an ordered list of dates (chronological).
 * `statusByDate` should only contain entries for dates that have a record; dates
 * absent from the map are treated as NOT_RECORDED.
 *
 * Streak rule (spec section 14 / 11):
 *  - GREEN, BLUE, YELLOW continue the streak.
 *  - RED breaks the streak (resets running count to 0).
 *  - NOT_RECORDED is neutral: it neither extends nor breaks the streak.
 *
 * Only dates up to and including `uptoIso` (default today) are considered, since
 * future mission days haven't happened yet and must never count as breaks.
 */
export function computeStreaks(
  orderedDates: string[],
  statusByDate: Map<string, Status>,
  uptoIso: string = todayIso()
): StreakInfo {
  let running = 0
  let longest = 0
  let current = 0
  let greenCount = 0
  let blueCount = 0
  let redCount = 0
  let yellowCount = 0
  let notRecordedCount = 0

  for (const date of orderedDates) {
    if (date > uptoIso) break // future day: doesn't exist yet
    const status: Status = statusByDate.get(date) ?? 'not_recorded'

    switch (status) {
      case 'green':
        greenCount++
        break
      case 'blue':
        blueCount++
        break
      case 'red':
        redCount++
        break
      case 'yellow':
        yellowCount++
        break
      default:
        notRecordedCount++
    }

    const effect = streakEffect(status)
    if (effect === 'continue') {
      running++
      if (running > longest) longest = running
    } else if (effect === 'break') {
      running = 0
    }
    // 'neutral' (not_recorded): running unchanged

    current = running
  }

  return {
    current,
    longest,
    greenCount,
    blueCount,
    redCount,
    yellowCount,
    notRecordedCount,
    completedCount: greenCount + blueCount + yellowCount
  }
}
