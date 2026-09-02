import clsx from 'clsx'

export function Segmented<T extends string>({
  options,
  value,
  onChange
}: {
  options: Array<{ value: T; label: string }>
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="flex rounded-full bg-line/60 dark:bg-line-dark/60 p-1 gap-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={clsx(
            'flex-1 text-sm py-2 rounded-full transition-colors font-medium',
            value === opt.value
              ? 'bg-surface dark:bg-surface-dark text-ink dark:text-ink-dark shadow-sm'
              : 'text-muted dark:text-muted-dark'
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
