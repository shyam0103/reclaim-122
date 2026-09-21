import { useEffect, useMemo, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useMission } from '../hooks/useMission'
import { DayRecord, ExcuseReason, GoalRecord, Status } from '../types'
import { Segmented } from '../components/Segmented'
import { Card } from '../components/Card'
import { StatusDot } from '../components/StatusDot'
import { disciplineStatusFromPornFree, fitnessAutoStatus, progressAutoStatus } from '../lib/status'
import { todayIso, missionDayNumber, isWithinMission } from '../lib/dates'
import { STATUS_LABEL } from '../lib/statusUi'

const EXCUSE_OPTIONS: Array<{ value: ExcuseReason; label: string }> = [
  { value: 'travel', label: 'Travel' },
  { value: 'illness', label: 'Illness' },
  { value: 'family', label: 'Family' },
  { value: 'work', label: 'Work' },
  { value: 'emergency', label: 'Emergency' },
  { value: 'other', label: 'Other' }
]

type Override = 'auto' | 'blue' | 'yellow'

interface GoalDraft {
  override: Override
  excuseReason: ExcuseReason
  // discipline
  pornFree: boolean | null
  // fitness
  workoutDone: boolean
  steps: string
  weight: string
  // pm / python shared shape
  progress: 'done' | 'partial' | 'not_done'
  applicationCount: string
  learningMinutes: string
}

function emptyDraft(): GoalDraft {
  return {
    override: 'auto',
    excuseReason: 'other',
    pornFree: null,
    workoutDone: false,
    steps: '',
    weight: '',
    progress: 'not_done',
    applicationCount: '',
    learningMinutes: ''
  }
}

function draftFromRecord(g: GoalRecord | undefined): GoalDraft {
  const d = emptyDraft()
  if (!g) return d
  d.override = g.status === 'yellow' ? 'yellow' : g.status === 'blue' ? 'blue' : 'auto'
  d.excuseReason = g.excuseReason ?? 'other'
  d.pornFree = g.disciplinePornFree ?? null
  if (g.fitness) {
    d.workoutDone = g.fitness.workoutDone
    d.steps = g.fitness.steps?.toString() ?? ''
    d.weight = g.fitness.weight?.toString() ?? ''
  }
  if (g.pm) {
    d.progress = g.pm.meaningfulProgress
    d.applicationCount = g.pm.applicationCount ? g.pm.applicationCount.toString() : ''
  }
  if (g.python) {
    d.progress = g.python.meaningfulProgress
    d.learningMinutes = g.python.learningMinutes ? g.python.learningMinutes.toString() : ''
  }
  return d
}

export function Today({ userId }: { userId: string | null }) {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const date = params.get('date') ?? todayIso()
  const m = useMission(userId)
  const dayNumber = missionDayNumber(date)

  const [discipline, setDiscipline] = useState<GoalDraft>(emptyDraft())
  const [fitness, setFitness] = useState<GoalDraft>(emptyDraft())
  const [pm, setPm] = useState<GoalDraft>(emptyDraft())
  const [python, setPython] = useState<GoalDraft>(emptyDraft())
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const rec = m.records.get(date)
    setDiscipline(draftFromRecord(rec?.goals.discipline))
    setFitness(draftFromRecord(rec?.goals.fitness))
    setPm(draftFromRecord(rec?.goals.pm))
    setPython(draftFromRecord(rec?.goals.python))
    setNote(rec?.note ?? '')
    setSaved(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, m.loading])

  function resolveStatus(draft: GoalDraft, auto: 'green' | 'red' | null): Status {
    if (draft.override === 'yellow') return 'yellow'
    if (draft.override === 'blue') return 'blue'
    return auto ?? 'red'
  }

  const disciplineAuto = discipline.pornFree === null ? null : disciplineStatusFromPornFree(discipline.pornFree)
  const fitnessAuto = fitnessAutoStatus(fitness.workoutDone)
  const pmAuto = progressAutoStatus(pm.progress)
  const pythonAuto = progressAutoStatus(python.progress)

  const disciplineStatus = resolveStatus(discipline, disciplineAuto)
  const fitnessStatus = resolveStatus(fitness, fitnessAuto)
  const pmStatus = resolveStatus(pm, pmAuto)
  const pythonStatus = resolveStatus(python, pythonAuto)

  const withinMission = isWithinMission(date)
  const isFuture = date > todayIso()

  async function handleSave() {
    setSaving(true)
    const goals: DayRecord['goals'] = {}

    if (discipline.pornFree !== null || discipline.override !== 'auto') {
      goals.discipline = {
        goal: 'discipline',
        status: disciplineStatus,
        excuseReason: discipline.override === 'yellow' ? discipline.excuseReason : null,
        disciplinePornFree: discipline.pornFree
      }
    }
    if (fitness.workoutDone || fitness.steps || fitness.weight || fitness.override !== 'auto') {
      goals.fitness = {
        goal: 'fitness',
        status: fitnessStatus,
        excuseReason: fitness.override === 'yellow' ? fitness.excuseReason : null,
        fitness: {
          workoutDone: fitness.workoutDone,
          steps: fitness.steps ? Number(fitness.steps) : null,
          weight: fitness.weight ? Number(fitness.weight) : null
        }
      }
    }
    if (pm.progress !== 'not_done' || pm.applicationCount || pm.override !== 'auto') {
      goals.pm = {
        goal: 'pm',
        status: pmStatus,
        excuseReason: pm.override === 'yellow' ? pm.excuseReason : null,
        pm: { meaningfulProgress: pm.progress, applicationCount: pm.applicationCount ? Number(pm.applicationCount) : 0 }
      }
    }
    if (python.progress !== 'not_done' || python.learningMinutes || python.override !== 'auto') {
      goals.python = {
        goal: 'python',
        status: pythonStatus,
        excuseReason: python.override === 'yellow' ? python.excuseReason : null,
        python: {
          meaningfulProgress: python.progress,
          learningMinutes: python.learningMinutes ? Number(python.learningMinutes) : 0
        }
      }
    }

    await m.save({ date, overallStatus: 'not_recorded', note: note || null, goals })
    setSaving(false)
    setSaved(true)
  }

  if (!withinMission) {
    return <CenteredNote text="This date is outside the RECLAIM 122 mission window (Sep 1 – Dec 31, 2026)." />
  }
  if (isFuture) {
    return <CenteredNote text="You can't check in for a future day yet." />
  }
  if (m.loading) return <CenteredNote text="Loading…" />

  return (
    <div className="px-5 pt-6 pb-32 max-w-md mx-auto">
      <h1 className="text-xl font-semibold tracking-tight">{date === todayIso() ? 'Today' : date}</h1>
      {dayNumber && <p className="text-sm text-muted dark:text-muted-dark mt-0.5">Mission day {dayNumber}</p>}

      <div className="flex flex-col gap-4 mt-6">
        {/* Discipline */}
        <Card>
          <SectionHeader title="Discipline" status={disciplineStatus} />
          <Segmented
            options={[
              { value: 'yes', label: 'Porn-free' },
              { value: 'no', label: 'Not porn-free' }
            ]}
            value={discipline.pornFree === null ? '' : discipline.pornFree ? 'yes' : 'no'}
            onChange={(v) => setDiscipline((d) => ({ ...d, pornFree: v === 'yes' }))}
          />
          <p className="text-xs text-muted dark:text-muted-dark mt-2">
            Urges alone don't count against you — only intentional viewing + masturbation.
          </p>
          <ExcuseControls draft={discipline} setDraft={setDiscipline} />
        </Card>

        {/* Fitness */}
        <Card>
          <SectionHeader title="Fitness" status={fitnessStatus} />
          <Segmented
            options={[
              { value: 'done', label: 'Workout done' },
              { value: 'not', label: 'Not done' }
            ]}
            value={fitness.workoutDone ? 'done' : 'not'}
            onChange={(v) => setFitness((d) => ({ ...d, workoutDone: v === 'done' }))}
          />
          <div className="grid grid-cols-2 gap-2 mt-3">
            <NumberField label="Steps (optional)" value={fitness.steps} onChange={(v) => setFitness((d) => ({ ...d, steps: v }))} />
            <NumberField label="Weight (optional)" value={fitness.weight} onChange={(v) => setFitness((d) => ({ ...d, weight: v }))} />
          </div>
          <ExcuseControls draft={fitness} setDraft={setFitness} />
        </Card>

        {/* PM */}
        <Card>
          <SectionHeader title="Product Management" status={pmStatus} />
          <Segmented
            options={[
              { value: 'done', label: 'Done' },
              { value: 'partial', label: 'Partial' },
              { value: 'not_done', label: 'Not done' }
            ]}
            value={pm.progress}
            onChange={(v) => setPm((d) => ({ ...d, progress: v as GoalDraft['progress'] }))}
          />
          <div className="mt-3">
            <NumberField label="Applications submitted" value={pm.applicationCount} onChange={(v) => setPm((d) => ({ ...d, applicationCount: v }))} />
          </div>
          <ExcuseControls draft={pm} setDraft={setPm} />
        </Card>

        {/* Python */}
        <Card>
          <SectionHeader title="Python" status={pythonStatus} />
          <Segmented
            options={[
              { value: 'done', label: 'Done' },
              { value: 'partial', label: 'Partial' },
              { value: 'not_done', label: 'Not done' }
            ]}
            value={python.progress}
            onChange={(v) => setPython((d) => ({ ...d, progress: v as GoalDraft['progress'] }))}
          />
          <div className="mt-3">
            <NumberField label="Learning minutes" value={python.learningMinutes} onChange={(v) => setPython((d) => ({ ...d, learningMinutes: v }))} />
          </div>
          <ExcuseControls draft={python} setDraft={setPython} />
        </Card>

        {/* Note */}
        <Card>
          <p className="text-sm font-medium mb-2">Note (optional)</p>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="Anything worth remembering about today"
            className="w-full resize-none rounded-xl bg-line/40 dark:bg-line-dark/40 px-3 py-2 text-sm outline-none"
          />
        </Card>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="mt-6 w-full rounded-full bg-surface dark:bg-surface-dark
           border border-line dark:border-line-dark
           text-ink dark:text-ink-dark
           shadow-soft dark:shadow-soft-dark
           py-3.5 text-sm font-medium
           active:scale-[0.98] transition-transform disabled:opacity-60"
      >
        {saving ? 'Saving…' : saved ? 'Saved ✓  Save again' : 'Save day'}
      </button>
      {saved && (
        <button onClick={() => navigate('/')} className="mt-3 w-full text-center text-sm text-status-blue font-medium">
          Back to home
        </button>
      )}
    </div>
  )
}

function SectionHeader({ title, status }: { title: string; status: Status }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <p className="text-sm font-medium">{title}</p>
      <div className="flex items-center gap-1.5">
        <StatusDot status={status} size="sm" />
        <span className="text-xs text-muted dark:text-muted-dark">{STATUS_LABEL[status]}</span>
      </div>
    </div>
  )
}

function NumberField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs text-muted dark:text-muted-dark">{label}</span>
      <input
        type="number"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl bg-line/40 dark:bg-line-dark/40 px-3 py-2 text-sm outline-none"
      />
    </label>
  )
}

function ExcuseControls({ draft, setDraft }: { draft: GoalDraft; setDraft: (fn: (d: GoalDraft) => GoalDraft) => void }) {
  return (
    <div className="mt-3 pt-3 border-t border-line dark:border-line-dark flex flex-col gap-2">
      <div className="flex gap-2">
        <ToggleChip
          active={draft.override === 'blue'}
          label="Mark partial (Blue)"
          onClick={() => setDraft((d) => ({ ...d, override: d.override === 'blue' ? 'auto' : 'blue' }))}
        />
        <ToggleChip
          active={draft.override === 'yellow'}
          label="Mark excused (Yellow)"
          onClick={() => setDraft((d) => ({ ...d, override: d.override === 'yellow' ? 'auto' : 'yellow' }))}
        />
      </div>
      {draft.override === 'yellow' && (
        <div className="flex flex-wrap gap-1.5 mt-1">
          {EXCUSE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setDraft((d) => ({ ...d, excuseReason: opt.value }))}
              className={`text-xs px-2.5 py-1 rounded-full border ${
                draft.excuseReason === opt.value
                  ? 'bg-status-yellow/15 border-status-yellow text-status-yellow'
                  : 'border-line dark:border-line-dark text-muted dark:text-muted-dark'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function ToggleChip({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`text-xs px-3 py-1.5 rounded-full border font-medium ${
        active ? 'bg-ink dark:bg-ink-dark text-paper dark:text-paper-dark border-transparent' : 'border-line dark:border-line-dark text-muted dark:text-muted-dark'
      }`}
    >
      {label}
    </button>
  )
}

function CenteredNote({ text }: { text: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <p className="text-sm text-muted dark:text-muted-dark text-center">{text}</p>
    </div>
  )
}
