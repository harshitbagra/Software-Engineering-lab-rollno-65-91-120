import React, { useRef, useEffect } from 'react'
import { Card, CardHeader, Badge, Btn } from '../components/UI'

const logColors = {
  success: 'var(--success)',
  info:    'var(--accent)',
  warning: 'var(--warning)',
  error:   'var(--danger)',
}

function formatTime(secs) {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}m ${String(s).padStart(2,'0')}s`
}

export default function Logs({ showToast, liveState }) {
  const { buildNumber, currentStage, pipelineStatus, liveLogs, liveTime, STAGES } = liveState
  const bottomRef = useRef(null)

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [liveLogs])

  const stageName = STAGES?.[currentStage] || '—'

  return (
    <div className="page-enter">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.03em' }}>Pipeline Logs</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: 4, fontFamily: 'var(--font-mono)' }}>// live execution output — auto-streaming</p>
      </div>

      <Card>
        <CardHeader
          title={`Build #${buildNumber} — main branch`}
          right={
            <>
              <Badge status={pipelineStatus === 'success' ? 'success' : 'running'}>
                {pipelineStatus === 'success' ? 'Complete' : '● Live'}
              </Badge>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--muted)' }}>
                {formatTime(liveTime)}
              </span>
              <Btn variant="outline" style={{ padding: '4px 12px', fontSize: '0.74rem' }}
                onClick={() => showToast('Logs cleared', 'info', '🗑️')}>
                Export
              </Btn>
            </>
          }
        />

        <div style={{ padding: 16 }}>
          <div style={{
            background: '#050810',
            border: '1px solid var(--border)',
            borderRadius: 10, padding: 20,
            fontFamily: 'var(--font-mono)', fontSize: '0.79rem',
            lineHeight: 1.9, height: 400, overflowY: 'auto',
          }}>
            {liveLogs.length === 0 && (
              <span style={{ color: 'var(--muted)' }}>Waiting for pipeline to start...</span>
            )}
            {liveLogs.map((line, i) => (
              <div key={i} style={{ display: 'flex', gap: 16 }}>
                <span style={{ color: 'var(--muted)', flexShrink: 0 }}>{line.time}</span>
                <span style={{ color: logColors[line.cls] || 'var(--text)' }}>{line.msg}</span>
              </div>
            ))}
            {/* Blinking cursor */}
            {pipelineStatus === 'running' && (
              <div style={{ display: 'flex', gap: 16 }}>
                <span style={{ color: 'var(--muted)' }}>{new Date().toTimeString().slice(0,8)}</span>
                <span style={{ color: 'var(--accent)', animation: 'pulse 1s infinite' }}>█</span>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>
      </Card>

      {/* Stage breakdown — live */}
      <Card>
        <CardHeader title={`Stage Breakdown — Build #${buildNumber}`} />
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {(STAGES || []).map((s, i) => {
            const isDone    = i < currentStage || pipelineStatus === 'success'
            const isRunning = i === currentStage && pipelineStatus === 'running'
            const isPending = i > currentStage && pipelineStatus !== 'success'
            const status    = isDone ? 'success' : isRunning ? 'running' : 'warning'
            const label     = isDone ? 'Done' : isRunning ? 'Running' : 'Pending'

            return (
              <div key={s} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 14px',
                background: isRunning ? 'rgba(0,229,255,0.06)' : 'var(--surface2)',
                borderRadius: 8,
                border: isRunning ? '1px solid rgba(0,229,255,0.2)' : '1px solid transparent',
                transition: 'all 0.3s',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: '1rem' }}>
                    {isDone ? '✅' : isRunning ? '⚙️' : '⏳'}
                  </span>
                  <span style={{ fontWeight: 600, fontSize: '0.86rem', textTransform: 'capitalize' }}>{s}</span>
                </div>
                <Badge status={status}>{label}</Badge>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
