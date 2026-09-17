import type { OperatorProductionCurrentStep } from '@/features/operator-production/types'
import { RecipeStepType } from '@/features/recipes/types'

export const VOICE_GUIDANCE_ENABLED_KEY = 'mosa.voiceGuidance.enabled'

export function getVoiceGuidanceSessionKey(productionOrderId: string) {
  return `mosa.voiceGuidance.${productionOrderId}`
}

export function isVoiceGuidanceSupported() {
  return typeof window !== 'undefined'
    && 'speechSynthesis' in window
    && 'SpeechSynthesisUtterance' in window
}

export function buildStepVoiceInstruction(step: OperatorProductionCurrentStep | null | undefined) {
  if (!step) return null

  const instruction = step.instruction?.trim()
  switch (step.stepType) {
    case RecipeStepType.Material: {
      const materialName = step.rawMaterialName ?? step.stepName
      const unit = step.unitOfMeasureSymbol ? ` ${step.unitOfMeasureSymbol}` : ''
      const quantity = step.targetQuantity === null ? '' : ` sebanyak ${formatNumber(step.targetQuantity)}${unit}`
      return instruction
        ? `${instruction}.`
        : `Tambahkan ${materialName}${quantity}.`
    }
    case RecipeStepType.Timer: {
      const duration = formatSpokenDuration(step.timerSeconds ?? 0)
      return instruction
        ? `Mulai timer. ${instruction}. Durasi ${duration}.`
        : `Mulai timer selama ${duration}.`
    }
    case RecipeStepType.Process:
      return instruction ? `Mulai proses. ${instruction}.` : `Mulai proses ${step.stepName}.`
    case RecipeStepType.Check:
      return instruction
        ? `Lakukan pemeriksaan. ${instruction}. Centang konfirmasi setelah selesai.`
        : `Lakukan pemeriksaan ${step.stepName}. Centang konfirmasi setelah selesai.`
    default:
      return `Mulai langkah ${step.sequence}. ${step.stepName}.`
  }
}

export function speakStepInstruction(text: string) {
  if (!isVoiceGuidanceSupported()) return

  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'id-ID'
  utterance.rate = 0.95
  utterance.pitch = 1
  utterance.volume = 1

  const voices = window.speechSynthesis.getVoices()
  const indonesianVoice = voices.find((voice) => voice.lang.toLowerCase().startsWith('id'))
  if (indonesianVoice) utterance.voice = indonesianVoice

  window.speechSynthesis.speak(utterance)
}

export function stopVoiceGuidance() {
  if (!isVoiceGuidanceSupported()) return
  window.speechSynthesis.cancel()
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 4 }).format(value)
}

function formatSpokenDuration(totalSeconds: number) {
  const secondsValue = Math.max(0, Math.round(totalSeconds))
  const hours = Math.floor(secondsValue / 3600)
  const minutes = Math.floor((secondsValue % 3600) / 60)
  const seconds = secondsValue % 60
  const parts: string[] = []

  if (hours > 0) parts.push(`${hours} jam`)
  if (minutes > 0) parts.push(`${minutes} menit`)
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds} detik`)

  return parts.join(' ')
}
