import fs from 'fs'
import path from 'path'
import { Exercise, ExercisesData } from '@/types'

const DATA_PATH = path.join(process.cwd(), 'data', 'exercises.json')

export function getExercisesData(): ExercisesData {
  const raw = fs.readFileSync(DATA_PATH, 'utf-8')
  return JSON.parse(raw) as ExercisesData
}

export function getAllExercises(): Exercise[] {
  const data = getExercisesData()
  return data.exercises.sort(
    (a, b) => new Date(b.pushedAt).getTime() - new Date(a.pushedAt).getTime()
  )
}

export function getExerciseBySlug(slug: string): Exercise | undefined {
  return getAllExercises().find((e) => e.slug === slug)
}

export function getAllTopics(): string[] {
  const exercises = getAllExercises()
  return ['All', ...Array.from(new Set(exercises.map((e) => e.topic)))]
}

export function getStats() {
  const exercises = getAllExercises()
  const topics = new Set(exercises.map((e) => e.topic)).size
  return {
    total: exercises.length,
    topics,
    beginner:     exercises.filter((e) => e.level === 'Beginner').length,
    intermediate: exercises.filter((e) => e.level === 'Intermediate').length,
    advanced:     exercises.filter((e) => e.level === 'Advanced').length,
  }
}
