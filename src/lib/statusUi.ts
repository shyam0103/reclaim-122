import { Status } from '../types'

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
