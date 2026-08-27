import { Link } from 'react-router-dom'

interface StatusPageProps {
  code: string
  title: string
  description: string
}

export function StatusPage({ code, title, description }: StatusPageProps) {
  return (
    <div className="flex h-dvh w-full flex-col items-center justify-center gap-2 bg-slate-50 px-6 text-center">
      <span className="text-sm font-semibold tracking-widest text-teal-600">{code}</span>
      <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
      <p className="max-w-sm text-sm text-slate-500">{description}</p>
      <Link
        to="/dashboard"
        className="mt-4 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
      >
        Kembali ke Dashboard
      </Link>
    </div>
  )
}
