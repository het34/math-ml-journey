import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getAllExercises, getExerciseBySlug } from '@/lib/exercises'
import Navbar from '@/components/Navbar'

export const dynamic = 'force-static'

export function generateStaticParams() {
  return getAllExercises().map((e) => ({ slug: e.slug }))
}

const LEVEL_STYLES = {
  Beginner:     'bg-green-900/40 text-green-400 border-green-800/50',
  Intermediate: 'bg-yellow-900/40 text-yellow-400 border-yellow-800/50',
  Advanced:     'bg-red-900/40 text-red-400 border-red-800/50',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
  })
}

export default function ExercisePage({ params }: { params: { slug: string } }) {
  const exercise = getExerciseBySlug(params.slug)
  if (!exercise) notFound()

  const levelStyle = LEVEL_STYLES[exercise.level] ?? LEVEL_STYLES.Beginner

  return (
    <>
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 py-12 animate-fade-in">

        {/* Back */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted text-sm font-mono hover:text-text transition-colors mb-10 group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span>
          All exercises
        </Link>

        {/* Header */}
        <header className="mb-10">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="text-accent font-mono text-xs tracking-widest uppercase">
              {exercise.topic}
            </span>
            <span className={`text-[11px] font-mono px-2 py-0.5 rounded border ${levelStyle}`}>
              {exercise.level}
            </span>
          </div>

          <h1 className="text-3xl font-light text-text leading-snug mb-4">
            {exercise.name}
          </h1>

          <p className="text-muted text-base leading-relaxed max-w-2xl">
            {exercise.description}
          </p>

          <div className="flex flex-wrap gap-2 mt-5">
            {exercise.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs font-mono px-2.5 py-1 rounded-full bg-surface border border-border text-muted"
              >
                #{tag}
              </span>
            ))}
          </div>
        </header>

        {/* Open in Colab CTA */}
        <a
          href={exercise.notebookUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="
            inline-flex items-center gap-3 px-6 py-3 rounded-xl mb-12
            bg-accent/10 border border-accent/30 text-accent
            hover:bg-accent hover:text-white transition-all duration-200
            font-mono text-sm font-medium group
          "
        >
          <span className="text-lg">🔗</span>
          Open in Google Colab
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </a>

        {/* Code snippet */}
        {exercise.snippet && (
          <section className="mb-10">
            <h2 className="text-sm font-mono text-muted uppercase tracking-widest mb-3">
              Code Snippet
            </h2>
            <div className="relative rounded-xl overflow-hidden border border-border">
              {/* Fake terminal bar */}
              <div className="flex items-center gap-1.5 px-4 py-2.5 bg-[#1A1A20] border-b border-border">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/60"/>
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60"/>
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/60"/>
                <span className="text-muted text-xs font-mono ml-3 opacity-50">.ipynb</span>
              </div>
              <pre className="bg-surface p-5 overflow-x-auto text-sm leading-relaxed">
                <code className="text-code font-mono whitespace-pre">{exercise.snippet}</code>
              </pre>
            </div>
          </section>
        )}

        {/* Meta footer */}
        <div className="rounded-xl border border-border bg-surface p-5 flex flex-wrap gap-6">
          <div>
            <p className="text-[11px] text-muted font-mono uppercase tracking-wider mb-1">Pushed on</p>
            <p className="text-text text-sm font-mono">{formatDate(exercise.pushedAt)}</p>
          </div>
          <div>
            <p className="text-[11px] text-muted font-mono uppercase tracking-wider mb-1">Notebook path</p>
            <p className="text-code text-xs font-mono">{exercise.notebookPath}</p>
          </div>
        </div>

      </main>
    </>
  )
}
