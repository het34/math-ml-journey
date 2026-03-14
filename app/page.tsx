import { getAllExercises, getAllTopics, getStats } from '@/lib/exercises'
import ExerciseList from '@/components/ExerciseList'

export const dynamic = 'force-static'

export default function HomePage() {
  const exercises = getAllExercises()
  const topics    = getAllTopics()
  const stats     = getStats()

  return <ExerciseList exercises={exercises} topics={topics} stats={stats} />
}
