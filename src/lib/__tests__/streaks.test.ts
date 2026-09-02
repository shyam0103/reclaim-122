import { describe, it, expect } from 'vitest'
import { computeStreaks } from '../streaks'
import { Status } from '../../types'

const D = (n: number) => `2026-09-${String(n).padStart(2, '0')}`
const dates = Array.from({ length: 10 }, (_, i) => D(i + 1))

function mapOf(entries: Array<[string, Status]>) {
  return new Map(entries)
}

describe('computeStreaks', () => {
  it('all green -> current == longest == count', () => {
    const m = mapOf(dates.map((d) => [d, 'green' as Status]))
    const s = computeStreaks(dates, m, D(10))
    expect(s.current).toBe(10)
    expect(s.longest).toBe(10)
    expect(s.greenCount).toBe(10)
  })

  it('a red day breaks the streak', () => {
    const m = mapOf([
      [D(1), 'green'], [D(2), 'green'], [D(3), 'red'], [D(4), 'green']
    ] as Array<[string, Status]>)
    const s = computeStreaks(dates.slice(0, 4), m, D(4))
    expect(s.current).toBe(1) // only day 4 after the break
    expect(s.longest).toBe(2) // days 1-2
    expect(s.redCount).toBe(1)
  })

  it('blue preserves the streak', () => {
    const m = mapOf([[D(1), 'green'], [D(2), 'blue'], [D(3), 'green']] as Array<[string, Status]>)
    const s = computeStreaks(dates.slice(0, 3), m, D(3))
    expect(s.current).toBe(3)
    expect(s.blueCount).toBe(1)
  })

  it('yellow preserves the streak', () => {
    const m = mapOf([[D(1), 'green'], [D(2), 'yellow'], [D(3), 'green']] as Array<[string, Status]>)
    const s = computeStreaks(dates.slice(0, 3), m, D(3))
    expect(s.current).toBe(3)
    expect(s.yellowCount).toBe(1)
  })

  it('not_recorded is neutral: does not break, does not extend', () => {
    const m = mapOf([[D(1), 'green'], [D(2), 'green']] as Array<[string, Status]>)
    // D(3) has no entry -> not_recorded
    const s = computeStreaks(dates.slice(0, 4), m, D(4))
    expect(s.notRecordedCount).toBe(2) // days 3 and 4
    expect(s.current).toBe(2) // streak frozen at 2, not broken, not extended by the gap
  })

  it('future dates beyond uptoIso are never evaluated', () => {
    const m = mapOf([[D(1), 'green'], [D(2), 'red']] as Array<[string, Status]>) // day 2 would break it
    const s = computeStreaks(dates.slice(0, 5), m, D(1)) // only look at day 1
    expect(s.current).toBe(1)
    expect(s.redCount).toBe(0)
  })
})
