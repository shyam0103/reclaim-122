import { describe, it, expect } from 'vitest'
import { computeOverallStatus, disciplineStatusFromPornFree, streakEffect } from '../status'
import { GoalRecord } from '../../types'

function goal(status: GoalRecord['status']): GoalRecord {
  return { goal: 'discipline', status, excuseReason: null }
}

describe('discipline rule', () => {
  it('porn-free = GREEN', () => {
    expect(disciplineStatusFromPornFree(true)).toBe('green')
  })
  it('not porn-free = RED (urges never cause RED, only intentional action)', () => {
    expect(disciplineStatusFromPornFree(false)).toBe('red')
  })
})

describe('overall day status', () => {
  it('no goals recorded -> not_recorded', () => {
    expect(computeOverallStatus({})).toBe('not_recorded')
  })

  it('any RED goal forces overall RED, even with other GREENs', () => {
    const status = computeOverallStatus({
      discipline: goal('red'),
      fitness: goal('green'),
      pm: goal('green'),
      python: goal('green')
    })
    expect(status).toBe('red')
  })

  it('all green -> overall green', () => {
    const status = computeOverallStatus({
      discipline: goal('green'),
      fitness: goal('green'),
      pm: goal('green'),
      python: goal('green')
    })
    expect(status).toBe('green')
  })

  it('yellow present, no red -> overall yellow', () => {
    const status = computeOverallStatus({
      discipline: goal('yellow'),
      fitness: goal('green')
    })
    expect(status).toBe('yellow')
  })

  it('blue present, no red/yellow -> overall blue', () => {
    const status = computeOverallStatus({
      discipline: goal('blue'),
      fitness: goal('green')
    })
    expect(status).toBe('blue')
  })
})

describe('streak effect', () => {
  it('green/blue/yellow continue; red breaks; not_recorded is neutral', () => {
    expect(streakEffect('green')).toBe('continue')
    expect(streakEffect('blue')).toBe('continue')
    expect(streakEffect('yellow')).toBe('continue')
    expect(streakEffect('red')).toBe('break')
    expect(streakEffect('not_recorded')).toBe('neutral')
  })
})
