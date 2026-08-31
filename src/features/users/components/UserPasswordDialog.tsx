import { Eye, EyeOff, KeyRound, LoaderCircle, Save } from 'lucide-react'
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { MasterDataFormFieldError } from '@/features/master-data/components/MasterDataFormFieldError'
import { getFieldError } from '@/features/master-data/utils'
import type { MasterDataFormErrors } from '@/features/master-data/types'

export function UserPasswordDialog({
  open,
  username,
  submitting,
  onOpenChange,
  onConfirm,
}: {
  open: boolean
  username: string
  submitting: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (newPassword: string) => void
}) {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<MasterDataFormErrors>({})

  function handleSubmit() {
    const nextErrors: MasterDataFormErrors = {}

    if (password.length === 0) {
      nextErrors.password = ['Password wajib diisi.']
    } else if (password.length < 8 || password.length > 128) {
      nextErrors.password = ['Password harus 8-128 karakter.']
    } else if (!/[A-Za-z]/.test(password)) {
      nextErrors.password = ['Password harus mengandung minimal satu huruf.']
    } else if (!/[0-9]/.test(password)) {
      nextErrors.password = ['Password harus mengandung minimal satu angka.']
    }

    setErrors(nextErrors)

    if (Object.keys(nextErrors).length === 0) {
      onConfirm(password)
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setPassword('')
      setShowPassword(false)
      setErrors({})
    }
    onOpenChange(nextOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md overflow-hidden p-0">
        {/* Accent bar */}
        <div className="absolute inset-x-0 top-0 h-1 rounded-t-[28px] bg-gradient-to-r from-rose-500 to-pink-400" />

        {/* Header */}
        <div className="px-7 pb-4 pt-8">
          <div className="flex items-start gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-700">
              <KeyRound size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-xl font-semibold text-ink">Ganti Password</h2>
                <span className="inline-flex items-center rounded-full bg-rose-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-rose-700">
                  Password
                </span>
              </div>
              <DialogDescription className="mt-0.5 text-[13px] text-slate-500">
                Masukkan password baru untuk <span className="font-semibold text-ink">{username}</span>.
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-100" />

        {/* Body */}
        <div className="px-7 py-5">
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                Password Baru
                <span className="text-red-400 normal-case">*</span>
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <KeyRound size={15} />
                </div>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 8 karakter"
                  className="h-12 pl-11 pr-11"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSubmit()
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition-colors hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <MasterDataFormFieldError message={getFieldError(errors, 'password')} />
              <p className="mt-1.5 text-[11px] leading-relaxed text-slate-400">
                8-128 karakter, harus mengandung huruf dan angka
              </p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-100" />

        {/* Footer */}
        <div className="px-7 py-4">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || password.length === 0}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-ink px-6 py-3.5 text-sm font-semibold text-paper shadow-md shadow-ink/20 transition-all duration-150 hover:bg-ink-light hover:shadow-lg active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
          >
            {submitting ? (
              <LoaderCircle size={15} className="animate-spin" />
            ) : (
              <Save size={15} />
            )}
            {submitting ? 'Menyimpan...' : 'Simpan Password'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
