import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Html5Qrcode } from 'html5-qrcode'
import { onAuthChange } from '../../services/auth'
import { getEventById } from '../../services/events'
import { checkInTicket } from '../../services/tickets'
import { ref, get } from 'firebase/database'
import { db } from '../../services/firebase'
import Navbar from '../../components/Navbar'
import './scanner.css'

const SCANNER_ID = 'qr-scanner'

export default function Scanner() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const scannerRef = useRef(null)

  useEffect(() => {
    const unsubscribe = onAuthChange(async (u) => {
      if (!u) {
        navigate('/login')
        return
      }
      const eventData = await getEventById(id)
      setEvent(eventData)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    return () => {
      stopScanner()
    }
  }, [])

  const startScanner = async () => {
    setError('')
    setResult(null)
    setScanning(true)

    try {
      const html5Qrcode = new Html5Qrcode(SCANNER_ID)
      scannerRef.current = html5Qrcode

      await html5Qrcode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          await handleScan(decodedText)
        },
        (err) => {
          // scanning errors are normal, ignore them
        }
      )
    } catch (err) {
      setError('Could not access camera. Please check permissions.')
      setScanning(false)
    }
  }

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop()
        scannerRef.current = null
      } catch (err) {
        // already stopped
      }
    }
    setScanning(false)
  }

  const handleScan = async (ticketId) => {
    if (processing) return
    setProcessing(true)
    await stopScanner()

    try {
      const snapshot = await get(ref(db, 'tickets/' + ticketId))

      if (!snapshot.exists()) {
        setResult({ valid: false, reason: 'Ticket not found' })
        setProcessing(false)
        return
      }

      const ticket = snapshot.val()

      if (ticket.eventId !== id) {
        setResult({ valid: false, reason: 'Ticket is for a different event' })
        setProcessing(false)
        return
      }

      if (ticket.checkedIn) {
        setResult({
          valid: false,
          reason: 'Ticket already used',
          checkedInAt: ticket.checkedInAt,
          ticketType: ticket.ticketType,
        })
        setProcessing(false)
        return
      }

      await checkInTicket(ticketId)

      setResult({
        valid: true,
        ticketType: ticket.ticketType,
        price: ticket.price,
        ticketId: ticketId.slice(0, 8).toUpperCase(),
      })
    } catch (err) {
      setResult({ valid: false, reason: 'Something went wrong. Please try again.' })
    } finally {
      setProcessing(false)
    }
  }

  const handleReset = () => {
    setResult(null)
    setError('')
  }

  return (
    <div>
      <Navbar />
      <div className="sc-page">
        <div className="sc-header">
          <button className="sc-back" onClick={() => navigate('/host/dashboard')}>← Back</button>
          <div>
            <h1 className="sc-title">{event?.title || 'Scanner'}</h1>
            <p className="sc-sub">Scan attendee QR codes to check them in</p>
          </div>
        </div>

        {loading ? (
          <p className="sc-loading">Loading...</p>
        ) : (
          <div className="sc-body">
            <div className="sc-scanner-wrap">
              <div id={SCANNER_ID} className="sc-viewfinder" />

              {!scanning && !result && (
                <div className="sc-idle">
                  <div className="sc-idle-icon">📷</div>
                  <p className="sc-idle-text">Camera is off</p>
                  <button className="sc-start-btn" onClick={startScanner}>
                    Start scanning
                  </button>
                </div>
              )}

              {scanning && (
                <div className="sc-controls">
                  <p className="sc-scanning-text">Point camera at QR code...</p>
                  <button className="sc-stop-btn" onClick={stopScanner}>
                    Stop
                  </button>
                </div>
              )}

              {error && (
                <div className="sc-error">
                  <p>{error}</p>
                  <button className="sc-start-btn" onClick={startScanner}>
                    Try again
                  </button>
                </div>
              )}
            </div>

            {result && (
              <div className={`sc-result ${result.valid ? 'sc-result-valid' : 'sc-result-invalid'}`}>
                <div className="sc-result-icon">
                  {result.valid ? '✅' : '❌'}
                </div>
                {result.valid ? (
                  <>
                    <h2 className="sc-result-title">Valid ticket</h2>
                    <p className="sc-result-detail">Type: {result.ticketType}</p>
                    <p className="sc-result-detail">
                      Price: {!result.price || result.price === 0 ? 'Free' : `P${result.price}`}
                    </p>
                    <p className="sc-result-detail">Ref: {result.ticketId}</p>
                    <p className="sc-result-sub">Checked in successfully</p>
                  </>
                ) : (
                  <>
                    <h2 className="sc-result-title">Invalid ticket</h2>
                    <p className="sc-result-detail">{result.reason}</p>
                    {result.checkedInAt && (
                      <p className="sc-result-sub">
                        Checked in at {new Date(result.checkedInAt).toLocaleTimeString()}
                      </p>
                    )}
                  </>
                )}
                <button className="sc-reset-btn" onClick={handleReset}>
                  {result.valid ? 'Scan next' : 'Try again'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}