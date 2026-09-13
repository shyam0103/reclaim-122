import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export interface MetricPoint {
  label: string
  value: number
}

/** Generic small metric chart (weight trend as a line, everything countable — steps,
 * applications, minutes — as weekly bars). Only rendered when there's enough real
 * data to say something, so it never shows a flat, meaningless line. */
export function MetricChart({
  points,
  color,
  kind = 'bar',
  unit
}: {
  points: MetricPoint[]
  color: string
  kind?: 'line' | 'bar'
  unit?: string
}) {
  if (points.length < 2) {
    return (
      <p className="text-xs text-muted dark:text-muted-dark text-center py-8">
        Not enough data yet — keep logging to see a trend here.
      </p>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={160}>
      {kind === 'line' ? (
        <LineChart data={points} margin={{ top: 8, right: 4, left: -24, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="currentColor" className="text-line dark:text-line-dark" strokeOpacity={0.6} />
          <XAxis dataKey="label" tick={{ fontSize: 10 }} className="text-muted dark:text-muted-dark" axisLine={false} tickLine={false} interval="preserveStartEnd" />
          <YAxis hide domain={['dataMin - 2', 'dataMax + 2']} />
          <Tooltip
            contentStyle={{ borderRadius: 12, border: 'none', fontSize: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.12)' }}
            formatter={((v: any) => [`${v}${unit ? ` ${unit}` : ''}`, '']) as any}
          />
          <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2.5} dot={{ r: 2.5 }} activeDot={{ r: 4 }} />
        </LineChart>
      ) : (
        <BarChart data={points} margin={{ top: 8, right: 4, left: -24, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="currentColor" className="text-line dark:text-line-dark" strokeOpacity={0.6} />
          <XAxis dataKey="label" tick={{ fontSize: 10 }} className="text-muted dark:text-muted-dark" axisLine={false} tickLine={false} interval="preserveStartEnd" />
          <YAxis hide />
          <Tooltip
            contentStyle={{ borderRadius: 12, border: 'none', fontSize: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.12)' }}
            formatter={((v: any) => [`${v}${unit ? ` ${unit}` : ''}`, '']) as any}
          />
          <Bar dataKey="value" radius={[6, 6, 6, 6]} fill={color} maxBarSize={22} />
        </BarChart>
      )}
    </ResponsiveContainer>
  )
}
