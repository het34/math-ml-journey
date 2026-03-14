'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import ExerciseCard from '@/components/ExerciseCard'
import type { Exercise } from '@/types'

// This data is injected at build time via the server component wrapper below.
// We keep the interactive filtering in this client component.

export default function ExerciseList({
  exercises,
  topics,
  stats,
}: {
  exercises: Exercise[]
  topics: string[]
  stats: { total: number; topics: number; beginner: number; intermediate: number; advanced: number }
}) {
  const [activeTopic, setActiveTopic] = useState('All')

  const filtered =
    activeTopic === 'All'
      ? exercises
      : exercises.filter((e) => e.topic === activeTopic)

  return (
    <>
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Hero */}
        <section className="mb-14 animate-fade-in">
          <p className="text-accent font-mono text-sm tracking-widest uppercase mb-3">
            Learning Journal
          </p>
          <h1 className="text-4xl font-light text-text leading-tight mb-4">
            Mathematical Foundations<br />
            <span className="text-muted">of Machine Learning</span>
          </h1>
          <p className="text-muted text-base max-w-xl leading-relaxed">
            Every exercise I complete from the Udemy course — tracked automatically,
            deployed live. Linear algebra, calculus, NumPy, PyTorch, TensorFlow.
          </p>

          {/* Stats row */}
          <div className="flex flex-wrap gap-6 mt-8">
            {[
              { label: 'Exercises',  value: stats.total },
              { label: 'Topics',     value: stats.topics },
              { label: 'Beginner',   value: stats.beginner },
              { label: 'Intermediate', value: stats.intermediate },
              { label: 'Advanced',   value: stats.advanced },
            ].map((s) => (
              <div key={s.label} className="flex flex-col gap-1">
                <span className="text-2xl font-mono font-semibold text-text">{s.value}</span>
                <span className="text-xs text-muted uppercase tracking-wider font-mono">{s.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Topic filter tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {topics.map((topic) => (
            <button
              key={topic}
              onClick={() => setActiveTopic(topic)}
              className={`
                px-4 py-1.5 rounded-full text-sm font-mono border transition-all
                ${activeTopic === topic
                  ? 'bg-accent border-accent text-white'
                  : 'border-border text-muted hover:border-accent/50 hover:text-text bg-transparent'
                }
              `}
            >
              {topic}
            </button>
          ))}
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-muted font-mono text-sm">No exercises yet for this topic.</p>
            <p className="text-muted/50 font-mono text-xs mt-2">Push a notebook to see it here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((exercise, i) => (
              <ExerciseCard key={exercise.slug} exercise={exercise} index={i} />
            ))}
          </div>
        )}

        {/* Footer */}
        <footer className="mt-20 pt-8 border-t border-border text-center">
          <p className="text-muted/50 text-xs font-mono">
            Auto-synced via GitHub Actions · Deployed on Vercel · Built by Het Tamboli
          </p>
        </footer>
      </main>
    </>
  )
}
