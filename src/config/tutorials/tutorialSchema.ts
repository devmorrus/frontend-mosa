import { canonicalRoutes } from '@/routes/canonicalRoutes'
import type { TutorialDefinition, TutorialStep } from '@/types/tutorial'

export interface TutorialSchemaIssue {
  tutorialId: string
  stepId?: string
  message: string
}

const KNOWN_ROUTES = new Set<string>([
  ...Object.values(canonicalRoutes),
  '/suppliers',
  '/lots/scan',
  '/production/recipes/create',
  '/production/recipes/approval-queue',
  '/production/orders/create',
  '/operator/production',
  '/quality-control',
  '/production/deviations',
  '/traceability',
  '/reports',
  '/admin/users',
  '/admin/roles',
  '/admin/audit-trail',
  '/menus',
  '/lots',
  '/inventory',
  '/stock-movements',
  '/help/tutorials',
])

/** Critical actions must never be ACTION steps (engine fail-safe, Tasking 5). */
const CRITICAL_SELECTOR_HINTS = [
  'post-btn',
  'approve-btn',
  'reject-btn',
  'release-btn',
  'decide-bar',
  'submit-btn',
  'complete',
]

/**
 * Dev/build-time schema validation for tutorial configs.
 * Returns issues (empty = valid). Never throws at runtime.
 */
export function validateTutorialSchema(tutorials: TutorialDefinition[]): TutorialSchemaIssue[] {
  const issues: TutorialSchemaIssue[] = []
  const seenIds = new Set<string>()

  for (const tutorial of tutorials) {
    if (!tutorial.id || !tutorial.id.trim()) {
      issues.push({ tutorialId: '(unknown)', message: 'Tutorial id is required.' })
      continue
    }
    const id = tutorial.id.trim()
    if (seenIds.has(id.toLowerCase())) {
      issues.push({ tutorialId: id, message: `Duplicate tutorial id '${id}'.` })
    }
    seenIds.add(id.toLowerCase())

    if (tutorial.steps.length === 0) {
      issues.push({ tutorialId: id, message: 'Tutorial must have at least one step.' })
      continue
    }

    tutorial.steps.forEach((step, index) => {
      const expectedNumber = index + 1
      if (step.stepNumber !== expectedNumber) {
        issues.push({
          tutorialId: id,
          stepId: step.id,
          message: `Step number must be sequential: expected ${expectedNumber}, got ${step.stepNumber}.`,
        })
      }
      if (!step.targetSelector.startsWith('[data-tour="') || !step.targetSelector.endsWith('"]')) {
        issues.push({
          tutorialId: id,
          stepId: step.id,
          message: `targetSelector must be a stable [data-tour="..."] selector, got '${step.targetSelector}'.`,
        })
      }
      if (step.route && !isKnownRoute(step.route)) {
        issues.push({
          tutorialId: id,
          stepId: step.id,
          message: `Unknown route '${step.route}'. Use canonicalRoutes.`,
        })
      }
      if (step.type === 'ACTION' && !step.requiredAction) {
        issues.push({
          tutorialId: id,
          stepId: step.id,
          message: 'ACTION step must declare requiredAction.',
        })
      }
      if (step.critical && step.type === 'ACTION') {
        issues.push({
          tutorialId: id,
          stepId: step.id,
          message: 'Critical step must be INFO, never ACTION (no auto critical transaction).',
        })
      }
      if (step.type === 'ACTION' && !step.critical && isCriticalSelector(step.targetSelector)) {
        issues.push({
          tutorialId: id,
          stepId: step.id,
          message: `Selector '${step.targetSelector}' looks critical; mark step critical:true and type INFO, or justify.`,
        })
      }
    })
  }

  return issues
}

function isKnownRoute(route: string): boolean {
  if (KNOWN_ROUTES.has(route)) return true
  // Dynamic detail routes: /lots/:id, /production/orders/:id, etc.
  return /^\/[a-z0-9/_-]+(\/[a-z0-9_-]+)*$/i.test(route)
}

function isCriticalSelector(selector: string): boolean {
  const lower = selector.toLowerCase()
  return CRITICAL_SELECTOR_HINTS.some((hint) => lower.includes(hint))
}

export function assertTutorialSchema(tutorials: TutorialDefinition[]): void {
  if (!import.meta.env.DEV) return
  const issues = validateTutorialSchema(tutorials)
  if (issues.length > 0) {
    console.warn('[tutorial-schema] issues found:', issues)
  }
}

export type { TutorialStep }
