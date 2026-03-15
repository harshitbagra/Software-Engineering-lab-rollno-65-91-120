import React from 'react'

const STAGE_META = [
  { key: 'commit',   label: 'Code\nCommit', icon: '📝' },
  { key: 'fetch',    label: 'Fetch\nSource', icon: '📥' },
  { key: 'build',    label: 'Build',         icon: '🔨' },
  { key: 'test',     label: 'Testing',       icon: '⚙️' },
  { key: 'deploy',   label: 'Deploy',        icon: '🚀' },
  { key: 'analyze',  label: 'Analyze',       icon: '🔍' },
  { key: 'recovery', label: 'Recovery',      icon: '🔄' },
  { key: 'report',   label: 'Report',        icon: '📊' },
]

export default function PipelineFlow({ buildNumber, currentStage, stageProgress, pipelineStatus }) {
  function getStatus(idx) {
    if (pipelineStatus === 'success') return 'done'
    if (idx < currentStage)  return 'done'
    if (idx === currentStage) return 'running'
    return 'idle'
  }

  const colors = {
    done:    'var(--success)',
    running: 'var(--accent)',
    idle:    'var(--muted)',
    failed:  'var(--danger)',
  }

  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 12, padding: 24, marginBottom: 28,
    }}>
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          // Active Pipeline — build #{buildNumber}
        </span>
        <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: pipelineStatus === 'success' ? 'var(--success)' : 'var(--accent)' }}>
          {pipelineStatus === 'success' ? '✓ Complete' : `Stage: ${STAGE_META[currentStage]?.key || '—'}`}
        </span>
      </div>

      {/* Stage circles */}
      <div style={{ display: 'flex', alignItems: 'center', overflowX: 'auto', paddingBottom: 8 }}>
        {STAGE_META.map((stage, i) => {
          const status = getStatus(i)
          const color  = colors[status]
          const isRunning = status === 'running'

          return (
            <React.Fragment key={stage.key}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                {/* Circle */}
                <div className={isRunning ? 'stage-running' : ''} style={{
                  width: 46, height: 46, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: status === 'done' ? '1rem' : '1.1rem',
                  border: `2px solid ${color}`,
                  background: status === 'done'    ? 'rgba(16,185,129,0.12)'
                             : status === 'running' ? 'rgba(0,229,255,0.12)'
                             : 'var(--bg)',
                  opacity: status === 'idle' ? 0.45 : 1,
                  transition: 'all 0.4s',
                  position: 'relative',
                }}>
                  {status === 'done' ? '✓' : stage.icon}

                  {/* Progress ring for running stage */}
                  {isRunning && (
                    <svg style={{ position: 'absolute', top: -3, left: -3, width: 52, height: 52, transform: 'rotate(-90deg)' }}>
                      <circle cx="26" cy="26" r="22"
                        fill="none" stroke="var(--accent)" strokeWidth="2"
                        strokeDasharray={`${2 * Math.PI * 22}`}
                        strokeDashoffset={`${2 * Math.PI * 22 * (1 - stageProgress / 100)}`}
                        style={{ transition: 'stroke-dashoffset 0.1s linear' }}
                      />
                    </svg>
                  )}
                </div>

                {/* Label */}
                <div style={{
                  fontSize: '0.68rem', fontWeight: 700, color,
                  textAlign: 'center', maxWidth: 72, lineHeight: 1.3,
                  whiteSpace: 'pre-line',
                }}>
                  {stage.label}
                </div>

                {/* Progress % under running stage */}
                {isRunning && (
                  <div style={{ fontSize: '0.62rem', fontFamily: 'var(--font-mono)', color: 'var(--accent)', marginTop: -4 }}>
                    {Math.round(stageProgress)}%
                  </div>
                )}
              </div>

              {/* Connector */}
              {i < STAGE_META.length - 1 && (
                <div style={{
                  flex: 1, height: 2, minWidth: 20, flexShrink: 0,
                  background: status === 'done'
                    ? 'var(--success)'
                    : status === 'running'
                    ? `linear-gradient(90deg, var(--success) ${stageProgress}%, var(--border) ${stageProgress}%)`
                    : 'var(--border)',
                  transition: 'background 0.3s',
                  position: 'relative',
                }}>
                  <span style={{
                    position: 'absolute', right: -5, top: -8, fontSize: 9,
                    color: status === 'done' ? 'var(--success)' : 'var(--border)',
                  }}>▶</span>
                </div>
              )}
            </React.Fragment>
          )
        })}
      </div>

      {/* Overall progress bar */}
      <div style={{ marginTop: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>
          <span>Overall Progress</span>
          <span style={{ color: 'var(--accent)' }}>
            {pipelineStatus === 'success'
              ? '100%'
              : `${Math.round(((currentStage + stageProgress / 100) / STAGE_META.length) * 100)}%`}
          </span>
        </div>
        <div style={{ background: 'var(--bg)', borderRadius: 4, height: 5, overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 4,
            background: pipelineStatus === 'success'
              ? 'var(--success)'
              : 'linear-gradient(90deg, var(--accent2), var(--accent))',
            width: pipelineStatus === 'success'
              ? '100%'
              : `${((currentStage + stageProgress / 100) / STAGE_META.length) * 100}%`,
            transition: 'width 0.2s ease',
          }} />
        </div>
      </div>
    </div>
  )
}
