import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

const rootElement = document.getElementById('root')!

async function bootstrap() {
  try {
    const { default: App } = await import('./App.tsx')
    createRoot(rootElement).render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Gagal memuat aplikasi.'
    rootElement.innerHTML = `<div style="min-height:100dvh;display:flex;align-items:center;justify-content:center;padding:24px;font-family:system-ui,sans-serif;background:#f8fafc;color:#0f172a"><div style="max-width:520px;text-align:center"><h1 style="font-size:20px;font-weight:700">Konfigurasi belum lengkap</h1><p style="margin-top:12px;font-size:14px;line-height:1.6">${message}</p><p style="margin-top:8px;font-size:13px;color:#64748b">Salin .env.example menjadi .env lalu isi VITE_API_BASE_URL, kemudian refresh halaman ini.</p></div></div>`
  }
}

void bootstrap()
