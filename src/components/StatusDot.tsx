import clsx from 'clsx'
import { Status } from '../types'
import { STATUS_DOT_CLASS } from '../lib/statusUi'

export function StatusDot({ status, size = 'md' }: { status: Status; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = size === 'sm' ? 'w-2 h-2' : size === 'lg' ? 'w-4 h-4' : 'w-2.5 h-2.5'
  return <span className={clsx('inline-block rounded-full', sizeClass, STATUS_DOT_CLASS[status])} />
}
