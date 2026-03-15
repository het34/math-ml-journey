export type Level = 'Beginner' | 'Intermediate' | 'Advanced'

export type CellOutputType = 'text' | 'image' | 'error'

export interface CellOutput {
  type: CellOutputType
  content: string
}

export interface NotebookCell {
  source: string
  outputs: CellOutput[]
}

export interface Exercise {
  slug: string
  name: string
  topic: string
  level: Level
  description: string
  tags: string[]
  snippet: string
  cells: NotebookCell[]
  notebookPath: string
  notebookUrl: string
  pushedAt: string
}

export interface ExercisesData {
  exercises: Exercise[]
  lastUpdated: string
}