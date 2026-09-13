import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { WeekBucket } from '../lib/weekly'

/** Weekly consistency trend: how many of each week's days were "completed"
 * (green + blue + yellow) vs off-track. One clear, useful signal — is the
 * trend improving or slipping recently — no clutter beyond that. */
export function WeeklyBarChart({ buckets, color }: { buckets: WeekBucket[]; color: string }) {
  const data = buckets.map((b) => ({
    label: b.label,
    completed: b.completed,
    total: b.total
  }))

  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="currentColor" className="text-line dark:text-line-dark" strokeOpacity={0.6} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 10, fill: 'currentColor' }}
          className="text-muted dark:text-muted-dark"
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis hide domain={[0, 7]} />
        <Tooltip
          cursor={{ fill: 'rgba(142,142,147,0.08)' }}
          contentStyle={{ borderRadius: 12, border: 'none', fontSize: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.12)' }}
          formatter={((v: any, _n: any, props: any) => [`${v} / ${props.payload.total} days`, 'On track']) as any}
        />
        <Bar dataKey="completed" radius={[6, 6, 6, 6]} fill={color} maxBarSize={18} />
      </BarChart>
    </ResponsiveContainer>
  )
}
