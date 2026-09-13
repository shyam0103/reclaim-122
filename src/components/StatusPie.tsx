import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { StreakInfo } from '../types'

const COLORS = {
  Green: '#3F9A6E',
  Blue: '#4A7FE0',
  Yellow: '#D9A441',
  Red: '#C4573F',
  'Not recorded': '#D5D3CE'
}

/** At-a-glance breakdown of how mission days so far have landed. Useful because it
 * shows composition (e.g. "mostly green with a few excused days") in one glance. */
export function StatusPie({ streak }: { streak: StreakInfo }) {
  const data = [
    { name: 'Green', value: streak.greenCount },
    { name: 'Blue', value: streak.blueCount },
    { name: 'Yellow', value: streak.yellowCount },
    { name: 'Red', value: streak.redCount },
    { name: 'Not recorded', value: streak.notRecordedCount }
  ].filter((d) => d.value > 0)

  if (data.length === 0) {
    return <p className="text-xs text-muted dark:text-muted-dark text-center py-8">No days recorded yet.</p>
  }

  return (
    <ResponsiveContainer width="100%" height={180}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={48} outerRadius={72} paddingAngle={2} strokeWidth={0}>
          {data.map((d) => (
            <Cell key={d.name} fill={COLORS[d.name as keyof typeof COLORS]} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ borderRadius: 12, border: 'none', fontSize: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.12)' }} />
      </PieChart>
    </ResponsiveContainer>
  )
}
