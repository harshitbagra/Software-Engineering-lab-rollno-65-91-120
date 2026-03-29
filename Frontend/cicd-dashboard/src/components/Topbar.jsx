import React from 'react'
import { Badge, Btn } from './UI'

export default function Topbar({ onRunPipeline, pipelineStatus, buildNumber }) {
  const statusMap = {
    running: { status: 'running', label: `Build #${buildNumber} Running` },
    success: { status: 'success', label: `Build #${buildNumber} Passed`  },
    failed:  { status: 'danger',  label: `Build #${buildNumber} Failed`  },
  }
  const s = statusMap[pipelineStatus] || statusMap.running

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 32px', height: 64,
      background: 'rgba(10,14,26,0.88)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.02em' }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
        }}>⚡</div>
        CI/CD <span style={{ color: 'var(--accent)', marginLeft: 4 }}>Pipeline</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Live clock */}
        <LiveClock />
        <Badge status={s.status}>{s.label}</Badge>
        <Btn variant="primary" onClick={onRunPipeline}>▶ Run Pipeline</Btn>
        <div style={{
          width: 34, height: 34, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--accent2), var(--accent))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer',
        }}>AD</div>
      </div>
    </header>
  )
}

function LiveClock() {
  const [time, setTime] = React.useState(new Date())
  React.useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  return (
    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--muted)' }}>
      {time.toTimeString().slice(0, 8)}
    </span>
  )
}
