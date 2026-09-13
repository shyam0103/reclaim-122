import { GoalKey, Status } from '../types'

/** Fixed per-goal identity colors — shown on icon badges regardless of that day's
 * status. Keeps a goal visually recognizable everywhere (home, calendar, analytics). */
export const GOAL_ACCENT: Record<GoalKey, string> = {
  discipline: '#8A7CF0',
  fitness: '#F2994A',
  pm: '#4A90E2',
  python: '#2BB673'
}

export const GOAL_ACCENT_SOFT_CLASS: Record<GoalKey, string> = {
  discipline: 'bg-goal-discipline/15',
  fitness: 'bg-goal-fitness/15',
  pm: 'bg-goal-pm/15',
  python: 'bg-goal-python/15'
}

export const GOAL_ACCENT_TEXT_CLASS: Record<GoalKey, string> = {
  discipline: 'text-goal-discipline',
  fitness: 'text-goal-fitness',
  pm: 'text-goal-pm',
  python: 'text-goal-python'
}

export const STATUS_LABEL: Record<Status, string> = {
  green: 'On track',
  blue: 'Partial',
  red: 'Off track',
  yellow: 'Excused',
  not_recorded: 'Not recorded'
}

export const STATUS_DOT_CLASS: Record<Status, string> = {
  green: 'bg-status-green',
  blue: 'bg-status-blue',
  red: 'bg-status-red',
  yellow: 'bg-status-yellow',
  not_recorded: 'bg-status-none'
}

export const STATUS_TEXT_CLASS: Record<Status, string> = {
  green: 'text-status-green',
  blue: 'text-status-blue',
  red: 'text-status-red',
  yellow: 'text-status-yellow',
  not_recorded: 'text-muted dark:text-muted-dark'
}

export const STATUS_BG_SOFT_CLASS: Record<Status, string> = {
  green: 'bg-status-green/10',
  blue: 'bg-status-blue/10',
  red: 'bg-status-red/10',
  yellow: 'bg-status-yellow/10',
  not_recorded: 'bg-status-none/20'
}
