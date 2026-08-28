import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Camera, ScanLine } from 'lucide-react'
import QrScanner from 'qr-scanner'
import qrScannerWorkerPath from 'qr-scanner/qr-scanner-worker.min?url'
import { Link, useNavigate } from 'react-router-dom'
import { rawMaterialLotsApi } from '@/api/rawMaterialLots.api'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { parseRawMaterialLotQrToken } from '@/features/raw-material-lots/utils'
import { normalizeScannedQrInput } from '@/features/raw-material-lots/validation'
import type { ApiError } from '@/types/api'

QrScanner.WORKER_PATH = qrScannerWorkerPath

export function RawMaterialLotScannerPage() {
  const navigate = useNavigate()
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const scannerRef = useRef<QrScanner | null>(null)
  const [manualInput, setManualInput] = useState('')
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [isResolving, setIsResolving] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [scanError, setScanError] = useState<string | null>(null)
  const [scanResult, setScanResult] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      scannerRef.current?.stop()
      scannerRef.current?.destroy()
      scannerRef.current = null
    }
  }, [])

  async function resolveScannedValue(rawValue: string) {
    const normalized = normalizeScannedQrInput(rawValue)
    const parsed = parseRawMaterialLotQrToken(normalized)

    setScanResult(normalized)
    setScanError(parsed.error)

    if (!parsed.token || isResolving) {
      return
    }

    setIsResolving(true)

    try {
      const detail = await rawMaterialLotsApi.resolveQrToken(parsed.token)
      stopScanner()
      navigate(`/lots/${detail.id}`)
    } catch (caughtError) {
      const apiError = caughtError as ApiError
      setScanError(apiError.status === 404 ? 'LOT tidak ditemukan.' : apiError.message)
    } finally {
      setIsResolving(false)
    }
  }

  function stopScanner() {
    scannerRef.current?.stop()
    scannerRef.current?.destroy()
    scannerRef.current = null
    setIsCameraOpen(false)
  }

  async function handleOpenCamera() {
    if (!videoRef.current) return

    setCameraError(null)
    setScanError(null)

    try {
      if (!window.isSecureContext && window.location.hostname !== 'localhost') {
        setCameraError('Camera access unavailable. Browser camera memerlukan HTTPS atau localhost.')
        return
      }

      stopScanner()

      const scanner = new QrScanner(
        videoRef.current,
        (result) => {
          if (isResolving) return
          void resolveScannedValue(result.data)
        },
        {
          preferredCamera: 'environment',
          highlightScanRegion: true,
          highlightCodeOutline: true,
          returnDetailedScanResult: true,
        },
      )

      scannerRef.current = scanner
      await scanner.start()
      setIsCameraOpen(true)
    } catch (caughtError) {
      const message =
        caughtError instanceof Error && /permission|denied|notallowed/i.test(caughtError.message)
          ? 'Camera access unavailable. Izin kamera ditolak dan manual LOT search tetap tersedia.'
          : 'Camera access unavailable. Periksa browser, device camera, atau izin akses.'
      setCameraError(message)
      stopScanner()
    }
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[30px] border border-ink/8 bg-ink px-6 py-7 text-paper shadow-[0_24px_80px_rgba(18,48,46,0.16)] sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(232,163,61,0.22),transparent_55%)]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <Button asChild variant="ghost" className="-ml-3 h-auto px-3 py-2">
              <Link to="/lots">
                <ArrowLeft size={16} />
                Kembali ke LOT list
              </Link>
            </Button>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-paper/10 bg-paper/6 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-paper/72">
              <ScanLine size={14} className="text-signal" />
              QR Scan Test
            </div>
            <h1 className="mt-5 font-display text-3xl font-semibold leading-tight text-paper sm:text-4xl">
              Uji scan QR LOT via browser camera
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-7 text-paper/68 sm:text-base">
              Flow V1 untuk validasi token QR LOT. Browser non-localhost umumnya membutuhkan HTTPS
              agar camera API bisa dipakai.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <Card className="rounded-[28px] border border-white/70 bg-white shadow-sm">
          <CardContent className="space-y-5 p-6">
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => void handleOpenCamera()}>
                <Camera size={16} />
                Open Camera
              </Button>
              <Button variant="secondary" onClick={stopScanner}>
                Stop Camera
              </Button>
            </div>

            <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-slate-950">
              <video
                ref={videoRef}
                className="aspect-[4/3] w-full object-cover"
                muted
                playsInline
              />
            </div>

            {cameraError ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                {cameraError}
              </div>
            ) : null}

            {scanError ? (
              <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                {scanError}
              </div>
            ) : null}

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              {isCameraOpen
                ? 'Kamera aktif. Arahkan QR LOT ke area video untuk resolve ke detail LOT.'
                : 'Kamera belum aktif. Jika kamera gagal dibuka, gunakan manual token/url input di panel samping atau kembali ke manual LOT search.'}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border border-white/70 bg-white shadow-sm">
          <CardContent className="space-y-5 p-6">
            <div>
              <h2 className="text-lg font-semibold text-ink">Manual Resolve Test</h2>
              <p className="mt-1 text-sm text-slate-500">
                Tempel token mentah atau full URL QR untuk validasi tanpa kamera.
              </p>
            </div>

            <Input
              value={manualInput}
              onChange={(event) => setManualInput(event.target.value)}
              placeholder="Contoh: TESTTOKEN1234567 atau https://mosa.domain/q/rm/TESTTOKEN1234567"
              className="h-12 rounded-2xl"
            />

            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => void resolveScannedValue(manualInput)}
                disabled={!manualInput.trim() || isResolving}
              >
                Resolve Token
              </Button>
              <Button asChild variant="ghost">
                <Link to="/lots">Manual LOT Search</Link>
              </Button>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              <div className="font-medium text-ink">Last scan/input</div>
              <div className="mt-1 break-all">{scanResult ?? '-'}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
