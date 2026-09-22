import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Camera, CheckCircle2, Info, LoaderCircle, QrCode, ScanLine, Search, ShieldCheck } from 'lucide-react'
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
  const isResolvingRef = useRef(false)
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

    if (!parsed.token || isResolvingRef.current) {
      return
    }

    isResolvingRef.current = true
    setIsResolving(true)

    try {
      const detail = await rawMaterialLotsApi.resolveQrToken(parsed.token)
      stopScanner()
      navigate(`/lots/${detail.id}`)
    } catch (caughtError) {
      const apiError = caughtError as ApiError
      setScanError(apiError.status === 404 ? 'LOT tidak ditemukan.' : apiError.message)
    } finally {
      isResolvingRef.current = false
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
          if (isResolvingRef.current) return
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
      <section className="rounded-[28px] border border-slate-200 bg-white px-5 py-6 shadow-sm sm:px-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <Button asChild variant="ghost" className="-ml-3 h-auto px-3 py-1.5 text-slate-500 hover:text-[#063b8c]">
              <Link to="/lots">
                <ArrowLeft size={16} />
                Kembali ke LOT list
              </Link>
            </Button>
            <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#0b5ed7]">
              <ScanLine size={15} />
              QR Scan Test
            </div>
            <h1 className="mt-2 font-display text-2xl font-semibold leading-tight text-ink sm:text-3xl">
              Scan QR LOT via browser camera
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
              Arahkan kamera ke label QR LOT atau tempel token manual untuk membuka detail LOT.
            </p>
          </div>
          <div className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm ${isCameraOpen ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-50 text-slate-600'}`}>
            {isCameraOpen ? <CheckCircle2 size={19} /> : <ShieldCheck size={19} className="text-[#0b5ed7]" />}
            <div><p className="text-xs font-medium opacity-70">Camera status</p><p className="font-semibold">{isCameraOpen ? 'Active' : 'Manual available'}</p></div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <Card className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <CardContent className="space-y-5 p-6">
            <div className="flex items-start gap-3 border-b border-slate-100 pb-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0b5ed7]"><Camera size={19} /></div>
              <div><h2 className="font-display text-xl font-semibold text-ink">Camera Scanner</h2><p className="mt-1 text-sm text-slate-500">Gunakan HTTPS atau localhost untuk akses camera browser.</p></div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button className="bg-[#063b8c] hover:bg-[#052f70]" onClick={() => void handleOpenCamera()}>
                <Camera size={16} />
                Open Camera
              </Button>
              <Button variant="secondary" onClick={stopScanner}>
                Stop Camera
              </Button>
            </div>

            <div className="relative overflow-hidden rounded-[24px] border border-slate-200 bg-slate-950">
              <video
                ref={videoRef}
                className="aspect-[4/3] max-h-[60dvh] w-full object-cover"
                muted
                playsInline
              />
              <div className="pointer-events-none absolute inset-[18%] rounded-3xl border-2 border-amber-400/90" />
            </div>

            {cameraError ? (
              <div className="flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                <Info size={17} className="mt-0.5 shrink-0" />
                {cameraError}
              </div>
            ) : null}

            {scanError ? (
              <div className="flex items-start gap-2 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                <Info size={17} className="mt-0.5 shrink-0" />
                {scanError}
              </div>
            ) : null}

            <div className={`flex items-start gap-2 rounded-2xl border px-4 py-3 text-sm ${isCameraOpen ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-slate-50 text-slate-600'}`}>
              {isCameraOpen ? <CheckCircle2 size={17} className="mt-0.5 shrink-0" /> : <Info size={17} className="mt-0.5 shrink-0" />}
              {isCameraOpen ? 'Kamera aktif. Arahkan QR LOT ke area video untuk resolve ke detail LOT.' : 'Kamera belum aktif. Jika kamera gagal dibuka, gunakan manual token/url input di panel samping.'}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <CardContent className="space-y-5 p-6">
            <div className="flex items-start gap-3 border-b border-slate-100 pb-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0b5ed7]"><QrCode size={19} /></div>
              <div><h2 className="font-display text-xl font-semibold text-ink">Manual Resolve</h2><p className="mt-1 text-sm text-slate-500">Tempel token QR atau full URL untuk validasi tanpa kamera.</p></div>
            </div>

            <div className="relative"><Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /><Input value={manualInput} onChange={(event) => setManualInput(event.target.value)} placeholder="Token QR atau https://mosa.domain/q/rm/..." className="h-12 rounded-2xl pl-11" /></div>

            <div className="flex flex-wrap gap-3">
              <Button className="bg-[#063b8c] hover:bg-[#052f70]"
                onClick={() => void resolveScannedValue(manualInput)}
                disabled={!manualInput.trim() || isResolving}
              >
                {isResolving ? <LoaderCircle size={16} className="animate-spin" /> : <Search size={16} />}
                {isResolving ? 'Resolving...' : 'Resolve Token'}
              </Button>
              <Button asChild variant="ghost">
                <Link to="/lots">Manual LOT Search</Link>
              </Button>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              <div className="font-medium text-ink">Last scan/input</div>
              <div className="mt-1 break-all font-mono text-xs">{scanResult ?? '-'}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
