"use client"

import { useState, useRef, useCallback, useEffect } from "react"

interface StartViewProps {
  onStartSession: () => void
  displayName?: string | null
  userEmail?: string | null
  authProvider?: string | null
  onOpenSettings?: () => void
  onOpenLibrary?: () => void
  onOpenAssignments?: () => void
  onOpenFeedback?: () => void
  onSignOut?: () => void
  isMusicPlaying?: boolean
  onToggleMusic?: () => void
  lyricsLine?: string | null
  lyricsOpacity?: number
  isConnecting?: boolean
}

// E2E mode: instant hold (0ms) so a single click triggers onStartSession
const isE2ETesting =
  process.env.NEXT_PUBLIC_E2E_TESTING === "true" &&
  process.env.NODE_ENV === "development"

const HOLD_DURATION = isE2ETesting ? 0 : 3000 // 3 seconds in production, instant in E2E
const STROKE_WIDTH = 6
const PROGRESS_STROKE_WIDTH = 10

function useOrbSize(containerRef: React.RefObject<HTMLDivElement | null>) {
  const [size, setSize] = useState(300)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const update = () => {
      const w = el.clientWidth
      const h = el.clientHeight
      const isMobile = w < 640
      const s = isMobile
        ? Math.min(w * 0.65, h * 0.45, 350)
        : Math.min(w * 0.45, h * 0.45, 420)
      setSize(Math.round(s))
    }

    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [containerRef])

  return size
}

export function StartView({
  onStartSession,
  displayName,
  userEmail,
  authProvider,
  onOpenSettings,
  onOpenLibrary,
  onOpenAssignments,
  onOpenFeedback,
  onSignOut,
  isMusicPlaying,
  onToggleMusic,
  lyricsLine,
  lyricsOpacity = 0,
  isConnecting = false,
}: StartViewProps) {
  const [holdProgress, setHoldProgress] = useState(0)
  const [isHolding, setIsHolding] = useState(false)
  const [holdComplete, setHoldComplete] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showNameEdit, setShowNameEdit] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const animFrameRef = useRef<number>(0)
  const startTimeRef = useRef<number>(0)
  const holdingRef = useRef(false)

  const orbSize = useOrbSize(containerRef)
  const radius = (orbSize - PROGRESS_STROKE_WIDTH) / 2
  const circumference = 2 * Math.PI * radius

  const startHold = useCallback(() => {
    if (holdComplete) return
    // E2E fast path: skip rAF so same-tick mousedown+mouseup always fires onStartSession
    if (HOLD_DURATION <= 0) {
      setHoldComplete(true)
      onStartSession()
      return
    }
    setIsHolding(true)
    holdingRef.current = true
    startTimeRef.current = performance.now()

    const animate = (now: number) => {
      if (!holdingRef.current) return
      const elapsed = now - startTimeRef.current
      const progress = HOLD_DURATION <= 0 ? 1 : Math.min(elapsed / HOLD_DURATION, 1)
      setHoldProgress(progress)

      if (progress >= 1) {
        holdingRef.current = false
        setIsHolding(false)
        setHoldComplete(true)
        setTimeout(() => onStartSession(), 200)
        return
      }

      animFrameRef.current = requestAnimationFrame(animate)
    }

    animFrameRef.current = requestAnimationFrame(animate)
  }, [holdComplete, onStartSession])

  const cancelHold = useCallback(() => {
    if (!holdingRef.current && !isHolding) return
    holdingRef.current = false
    setIsHolding(false)
    cancelAnimationFrame(animFrameRef.current)
    setHoldProgress(0)
  }, [isHolding])

  // Auto-hide settings after 5s
  useEffect(() => {
    if (!showSettings) return
    const t = setTimeout(() => setShowSettings(false), 5000)
    return () => clearTimeout(t)
  }, [showSettings])

  // Cleanup on unmount
  useEffect(() => {
    return () => cancelAnimationFrame(animFrameRef.current)
  }, [])

  const dashOffset = circumference * (1 - holdProgress)
  const glowBlur = holdComplete ? 26 : isHolding ? 12 : 8
  const glowOpacity = holdComplete ? 0.85 : isHolding ? 0.65 : 0.45
  const showText = !isHolding && !holdComplete && !isConnecting
  const hideControls = isHolding || holdComplete || isConnecting

  return (
    <div
      ref={containerRef}
      className="relative flex h-full flex-col items-center justify-center select-none overflow-hidden"
      style={{ background: "rgb(15, 18, 23)", WebkitUserSelect: "none", WebkitTouchCallout: "none" }}
    >
      {/* Controls overlay */}
      {!hideControls && (
        <StartControls
          onOpenSettings={() => setShowSettings((v) => !v)}
          onOpenLibrary={onOpenLibrary}
          onOpenAssignments={onOpenAssignments}
          onOpenFeedback={() => setShowFeedback(true)}
        />
      )}

      {/* Text above orb */}
      <div
        className="mb-[4vh] sm:mb-[6vh] text-center transition-opacity duration-300 px-4"
        style={{ opacity: showText ? 1 : 0 }}
      >
        <h1 className="text-2xl sm:text-4xl font-semibold" style={{ color: "rgb(255, 212, 26)" }}>
          Tap &amp; Hold to
          <br />
          Start Your Transformation
        </h1>
      </div>

      {/* Orb container */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Hold to start coaching session"
        className="relative cursor-pointer transition-opacity duration-1000"
        style={{
          width: orbSize,
          height: orbSize,
          opacity: isConnecting ? 0 : 1,
        }}
        onMouseDown={startHold}
        onMouseUp={cancelHold}
        onMouseLeave={cancelHold}
        onTouchStart={(e) => { e.preventDefault(); startHold() }}
        onTouchEnd={cancelHold}
        onTouchCancel={cancelHold}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); startHold() } }}
        onKeyUp={(e) => { if (e.key === "Enter" || e.key === " ") { cancelHold() } }}
      >
        {/* Outer glow (pulsing) */}
        <div
          className={holdComplete ? "" : isHolding ? "" : "animate-orb-pulse"}
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background: `rgba(247, 209, 66, ${glowOpacity})`,
            filter: `blur(${glowBlur}px)`,
            transform: holdComplete ? "scale(1.35)" : isHolding ? "scale(1.1)" : undefined,
            transition: "filter 0.35s ease, transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        />

        {/* Inner glow */}
        <div
          style={{
            position: "absolute",
            inset: "17.5%",
            borderRadius: "50%",
            background: `rgba(247, 209, 66, ${glowOpacity})`,
            filter: `blur(${glowBlur * 0.6}px)`,
            transition: "filter 0.35s ease",
          }}
        />

        {/* SVG orb + progress ring */}
        <svg
          width={orbSize}
          height={orbSize}
          viewBox={`0 0 ${orbSize} ${orbSize}`}
          className="relative z-10"
          style={{ pointerEvents: "none" }}
        >
          {/* Filled circle */}
          <circle
            cx={orbSize / 2}
            cy={orbSize / 2}
            r={radius}
            fill="rgba(247, 209, 66, 0.95)"
          />

          {/* Base stroke ring */}
          <circle
            cx={orbSize / 2}
            cy={orbSize / 2}
            r={radius}
            fill="none"
            stroke="rgba(255, 212, 26, 0.28)"
            strokeWidth={STROKE_WIDTH}
          />

          {/* White inner ring */}
          <circle
            cx={orbSize / 2}
            cy={orbSize / 2}
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.25)"
            strokeWidth={holdComplete ? 3 : 2}
          />

          {/* Progress ring */}
          {!holdComplete && (
            <circle
              cx={orbSize / 2}
              cy={orbSize / 2}
              r={radius}
              fill="none"
              stroke="rgb(255, 212, 26)"
              strokeWidth={PROGRESS_STROKE_WIDTH}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              transform={`rotate(-90 ${orbSize / 2} ${orbSize / 2})`}
              style={{ transition: holdProgress === 0 ? "stroke-dashoffset 0.25s ease-out" : "none" }}
            />
          )}
        </svg>
      </div>

      {/* Mascot fades in over the orb when connecting */}
      {isConnecting && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none"
          style={{ animation: "fadeIn 1.2s ease-in-out forwards" }}
        >
          <img
            src="/rumi_mascot.png"
            alt="Rumi"
            className="w-28 h-28 rounded-full object-cover"
            style={{ boxShadow: "0 0 40px rgba(247,209,66,0.3)" }}
          />
          <p className="mt-4 text-gray-400 font-medium">Rumi is getting ready...</p>
          <div className="flex gap-1.5 mt-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Lyrics display — sits between the orb and the song icon */}
      {isMusicPlaying && lyricsLine && (
        <p
          className="absolute left-1/2 -translate-x-1/2 w-full max-w-lg px-6 text-center text-2xl sm:text-3xl font-medium transition-opacity duration-500 pointer-events-none"
          style={{
            color: "rgb(255, 212, 26)",
            opacity: lyricsOpacity,
            bottom: "calc(4rem + 6vh)",
          }}
        >
          {lyricsLine}
        </p>
      )}

      {/* Music toggle at bottom — always visible when not holding */}
      {!hideControls && (
        <button
          onClick={onToggleMusic}
          aria-label={isMusicPlaying ? "Pause music" : "Play music"}
          className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 sm:gap-3 rounded-full px-5 py-2.5 sm:px-7 sm:py-3.5 transition-colors hover:bg-white/[0.08]"
          style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(8px)" }}
        >
          {isMusicPlaying ? (
            <svg className="w-6 h-6 sm:w-9 sm:h-9 text-yellow-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /></svg>
          ) : (
            <svg className="w-6 h-6 sm:w-9 sm:h-9 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" /></svg>
          )}
          <span className={`text-sm sm:text-xl font-medium ${isMusicPlaying ? "text-yellow-400/80" : "text-gray-500"}`}>
            {isMusicPlaying ? "Rumi: Poem of Atoms" : "Play Music"}
          </span>
        </button>
      )}

      {/* Settings panel */}
      <SettingsPanel
        isOpen={showSettings && !hideControls}
        displayName={displayName}
        isMusicPlaying={isMusicPlaying}
        onEditName={() => { setShowSettings(false); setShowNameEdit(true) }}
        onToggleMusic={onToggleMusic}
        onSignOut={onSignOut}
        onClose={() => setShowSettings(false)}
      />

      {/* Feedback dialog */}
      {showFeedback && (
        <FeedbackDialog onClose={() => setShowFeedback(false)} />
      )}

      {/* Name edit dialog */}
      {showNameEdit && (
        <NameEditDialog
          currentName={displayName ?? ""}
          userEmail={userEmail}
          authProvider={authProvider}
          onClose={() => setShowNameEdit(false)}
        />
      )}
    </div>
  )
}

/* ---------- StartControls ---------- */

function StartControls({
  onOpenSettings,
  onOpenLibrary,
  onOpenAssignments,
  onOpenFeedback,
}: {
  onOpenSettings?: () => void
  onOpenLibrary?: () => void
  onOpenAssignments?: () => void
  onOpenFeedback?: () => void
}) {
  return (
    <>
      {/* Top-left: Feedback */}
      <button
        onClick={onOpenFeedback}
        className="absolute left-4 top-4 sm:left-6 sm:top-6 z-20 rounded-full border-2 px-5 py-2 sm:px-8 sm:py-3 text-base sm:text-2xl text-white/80 transition-colors hover:text-white animate-control-pulse"
        style={{ borderColor: "rgba(255,255,255,0.4)" }}
      >
        Feedback
      </button>

      {/* Top-right: Icon buttons */}
      <div className="absolute right-3 top-4 sm:right-6 sm:top-6 z-20 flex flex-col gap-2 sm:gap-4">
        <ControlIconButton onClick={onOpenSettings} label="Settings">
          <svg className="w-7 h-7 sm:w-14 sm:h-14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>
        </ControlIconButton>
        <ControlIconButton onClick={onOpenLibrary} label="Library">
          <svg className="w-7 h-7 sm:w-14 sm:h-14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
        </ControlIconButton>
        <ControlIconButton onClick={onOpenAssignments} label="Assignments">
          <svg className="w-7 h-7 sm:w-14 sm:h-14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M8 7h8M8 12h8M8 17h4" /></svg>
        </ControlIconButton>
      </div>
    </>
  )
}

function ControlIconButton({
  onClick,
  label,
  children,
}: {
  onClick?: () => void
  label: string
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="flex h-12 w-12 sm:h-24 sm:w-24 items-center justify-center rounded-full text-white/70 transition-colors hover:text-white animate-control-pulse"
      style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(8px)" }}
    >
      {children}
    </button>
  )
}

/* ---------- SettingsPanel ---------- */

function SettingsPanel({
  isOpen,
  displayName,
  isMusicPlaying,
  onEditName,
  onToggleMusic,
  onSignOut,
  onClose,
}: {
  isOpen: boolean
  displayName?: string | null
  isMusicPlaying?: boolean
  onEditName?: () => void
  onToggleMusic?: () => void
  onSignOut?: () => void
  onClose?: () => void
}) {
  return (
    <div
      className="absolute bottom-10 left-1/2 z-20 flex -translate-x-1/2 items-center gap-10 rounded-full px-12 py-6 transition-transform duration-300"
      style={{
        background: "rgba(30,33,40,0.95)",
        backdropFilter: "blur(12px)",
        transform: isOpen
          ? "translate(-50%, 0)"
          : "translate(-50%, calc(100% + 40px))",
      }}
    >
      {/* Profile */}
      <button
        onClick={onEditName}
        className="flex flex-col items-center gap-2 text-white/70 hover:text-white transition-colors"
      >
        <div className="flex h-20 w-20 items-center justify-center rounded-full" style={{ background: "rgba(255,255,255,0.1)" }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
        </div>
        <span className="text-base">Profile</span>
      </button>

      {/* Music toggle */}
      <button
        onClick={onToggleMusic}
        className="flex flex-col items-center gap-2 text-white/70 hover:text-white transition-colors"
      >
        <div className="flex h-20 w-20 items-center justify-center rounded-full" style={{ background: "rgba(255,255,255,0.1)" }}>
          {isMusicPlaying ? (
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" /></svg>
          ) : (
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" /></svg>
          )}
        </div>
        <span className="text-base">Voice</span>
      </button>

      {/* Sign out */}
      <button
        onClick={onSignOut}
        className="flex flex-col items-center gap-2 text-white/70 hover:text-white transition-colors"
      >
        <div className="flex h-20 w-20 items-center justify-center rounded-full" style={{ background: "rgba(255,255,255,0.1)" }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
        </div>
        <span className="text-base">Sign Out</span>
      </button>
    </div>
  )
}

/* ---------- FeedbackDialog ---------- */

function FeedbackDialog({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div
        className="mx-4 w-full max-w-xl rounded-3xl border border-gray-800 p-10 space-y-6"
        style={{ background: "rgb(24,27,33)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-3xl font-bold text-white">Help Make Rumi Better</h2>
        <a
          href="sms:+13108828941"
          className="flex items-center gap-5 rounded-2xl px-8 py-5 text-white transition-colors hover:bg-white/5"
          style={{ background: "rgba(255,255,255,0.06)" }}
        >
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
          <span className="text-2xl">Text Founder</span>
        </a>
        <a
          href="mailto:support@rumi.team"
          className="flex items-center gap-5 rounded-2xl px-8 py-5 text-white transition-colors hover:bg-white/5"
          style={{ background: "rgba(255,255,255,0.06)" }}
        >
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
          <span className="text-2xl">Email Rumi Team</span>
        </a>
        <button
          onClick={onClose}
          className="mt-4 w-full rounded-2xl py-4 text-xl text-gray-400 transition-colors hover:text-white"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

/* ---------- NameEditDialog ---------- */

function NameEditDialog({
  currentName,
  userEmail,
  authProvider,
  onClose,
}: {
  currentName: string
  userEmail?: string | null
  authProvider?: string | null
  onClose: () => void
}) {
  const [name, setName] = useState(currentName)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!name.trim() || name.trim() === currentName) { onClose(); return }
    setSaving(true)
    try {
      const res = await fetch("/api/profile/update-name", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      })
      if (res.ok) {
        // Reload to pick up new name from auth metadata
        window.location.reload()
      }
    } catch {
      // silent fail
    }
    setSaving(false)
    onClose()
  }

  const emailDisplay = authProvider === "apple"
    ? "Logged in with your Apple ID"
    : userEmail ?? null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div
        className="mx-4 w-full max-w-sm rounded-2xl border border-gray-800 p-6 space-y-4"
        style={{ background: "rgb(24,27,33)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-white">Hi {currentName}</h2>
        {emailDisplay && (
          <p className="text-xs text-gray-500 -mt-2 truncate">{emailDisplay}</p>
        )}
        <p className="text-sm text-gray-400">What do you like Rumi to call you?</p>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-xl border border-gray-700 bg-black/40 px-4 py-3 text-white outline-none focus:border-yellow-400/50"
          autoFocus
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
        />
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl py-2.5 text-sm text-gray-400 transition-colors hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 rounded-xl py-2.5 text-sm font-medium text-black transition-colors disabled:opacity-50"
            style={{ background: "rgb(255, 212, 26)" }}
          >
            {saving ? "Saving..." : "Update"}
          </button>
        </div>
      </div>
    </div>
  )
}
