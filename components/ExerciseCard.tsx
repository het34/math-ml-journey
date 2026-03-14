import Link from 'next/link'
import { Exercise } from '@/types'

const LEVEL_STYLES = {
  Beginner:     'bg-green-900/40 text-green-400 border-green-800/50',
  Intermediate: 'bg-yellow-900/40 text-yellow-400 border-yellow-800/50',
  Advanced:     'bg-red-900/40 text-red-400 border-red-800/50',
}

const TOPIC_ACCENTS: Record<string, string> = {
  'Linear Algebra':  'border-l-violet-500',
  'Calculus':        'border-l-sky-500',
  'NumPy':           'border-l-orange-500',
  'PyTorch':         'border-l-rose-500',
  'TensorFlow':      'border-l-amber-500',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

export default function ExerciseCard({ exercise, index }: { exercise: Exercise; index: number }) {
  const accentBorder = TOPIC_ACCENTS[exercise.topic] ?? 'border-l-accent'
  const levelStyle   = LEVEL_STYLES[exercise.level] ?? LEVEL_STYLES.Beginner

  return (
    <Link
      href={`/exercises/${exercise.slug}`}
      className="group block"
      style={{ animationDelay: `${index * 60}ms`, animationFillMode: 'both' }}
    >
      <article
        className={`
          h-full bg-surface rounded-xl border border-border border-l-2 ${accentBorder}
          p-5 flex flex-col gap-3
          transition-all duration-200
          hover:border-accent/50 hover:bg-[#1C1C22] hover:-translate-y-0.5
          animate-slide-up
        `}
      >
        {/* Top row */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-text font-medium text-base leading-snug group-hover:text-accent transition-colors">
            {exercise.name}
          </h3>
          <span className={`shrink-0 text-[11px] font-mono px-2 py-0.5 rounded border ${levelStyle}`}>
            {exercise.level}
          </span>
        </div>

        {/* Topic */}
        <p className="text-muted text-xs font-mono tracking-wider uppercase">
          {exercise.topic}
        </p>

        {/* Description */}
        <p className="text-muted text-sm leading-relaxed line-clamp-2 flex-1">
          {exercise.description}
        </p>

        {/* Tags */}
        {exercise.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {exercise.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-bg border border-border text-muted"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-1 border-t border-border">
          <time className="text-[11px] text-muted font-mono">{formatDate(exercise.pushedAt)}</time>
          <span className="text-accent text-xs font-mono opacity-0 group-hover:opacity-100 transition-opacity">
            view →
          </span>
        </div>
      </article>
    </Link>
  )
}
