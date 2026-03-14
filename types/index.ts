export type Level = 'Beginner' | 'Intermediate' | 'Advanced'

export interface Exercise {
  slug: string
  name: string
  topic: string
  level: Level
  description: string
  tags: string[]
  snippet: string
  notebookPath: string
  notebookUrl: string
  pushedAt: string
}

export interface ExercisesData {
  exercises: Exercise[]
  lastUpdated: string
}
