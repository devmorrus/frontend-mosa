export type TutorialState = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED'

export type StepType = 'INFO' | 'ACTION'

export type ActionType = 'click' | 'select' | 'input' | 'route_change' | 'api_success'

export interface StepRequiredAction {
  type: ActionType
  elementSelector?: string
  validate?: () => boolean
}

export interface TutorialStep {
  id: string
  stepNumber: number
  totalSteps?: number
  title: string
  instruction: string
  type: StepType
  route?: string
  targetSelector: string
  targetFallback?: string
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'auto'
  requiredAction?: StepRequiredAction
  canSkip?: boolean
  /**
   * Critical steps (post/approve/release/decide/submit) must be INFO-only.
   * The engine treats critical+ACTION as INFO (fail-safe, Tasking 5).
   */
  critical?: boolean
}

export interface TutorialDefinition {
  id: string
  title: string
  description: string
  category: 'general' | 'master-data' | 'warehouse' | 'production' | 'traceability' | 'reports' | 'administration'
  requiredPermissions: string[]
  allowedRoles?: string[]
  steps: TutorialStep[]
}

export interface UserTutorialProgress {
  tutorialId: string
  status: TutorialState
  currentStepIndex: number
  completedAt?: string
  updatedAt: string
}
