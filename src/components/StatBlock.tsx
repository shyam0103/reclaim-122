export function StatBlock({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col">
      <span className="text-2xl font-semibold tabular-nums text-ink dark:text-ink-dark">{value}</span>
      <span className="text-xs text-muted dark:text-muted-dark mt-0.5">{label}</span>
    </div>
  )
}
