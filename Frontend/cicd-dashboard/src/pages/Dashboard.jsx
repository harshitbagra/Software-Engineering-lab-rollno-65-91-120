import React, { useState, useEffect } from 'react'
import { Card, CardHeader, Badge, Btn, NotifItem, Grid, StatCard } from '../components/UI'
import PipelineFlow from '../components/PipelineFlow'
import { pipelineRuns, notifications } from '../data/mockData'

function formatTime(secs) {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}m ${String(s).padStart(2,'0')}s`
}

function statusLabel(s) {
  return { running: 'Running', success: 'Passed', failed: 'Failed', warning: 'Retried' }[s] || s
}

export default function Dashboard({ onNavigate, showToast, liveState }) {
  const {
    buildNumber, currentStage, stageProgress,
    pipelineStatus, totalRuns, successRuns, failedRuns,
    liveTime, uptimePct, avgRecovery,
  } = liveState

  // Blinking live indicator
  const [blink, setBlink] = useState(true)
  useEffect(() => {
    const t = setInterval(() => setBlink(b => !b), 800)
    return () => clearInterval(t)
  }, [])

  const successRate = totalRuns > 0 ? ((successRuns / totalRuns) * 100).toFixed(1) : 0

  return (
    <div className="page-enter">
      {/* Header */}
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.03em' }}>Dashboard</h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: 4, fontFamily: 'var(--font-mono)' }}>
            // real-time pipeline overview
          </p>
        </div>
        {/* Live indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent)' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', opacity: blink ? 1 : 0.2, transition: 'opacity 0.3s' }} />
          LIVE &nbsp;|&nbsp; Elapsed: {formatTime(liveTime)}
        </div>
      </div>

      {/* Live stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }}>
        <StatCard label="Total Runs"     value={totalRuns}              sub={`↑ ${totalRuns - 142} new runs`}       color="var(--accent)"  accentColor="var(--accent)"  />
        <StatCard label="Successful"     value={successRuns}            sub={`${successRate}% success rate`}         color="var(--success)" accentColor="var(--success)" />
        <StatCard label="Failed"         value={failedRuns}             sub="Auto-recovery active"                    color="var(--danger)"  accentColor="var(--danger)"  />
        <StatCard label="Avg Recovery"   value={`${avgRecovery}m`}      sub="Mean time to recover"                   color="var(--warning)" accentColor="var(--warning)" />
      </div>

      {/* Live Pipeline Flow */}
      <PipelineFlow
        buildNumber={buildNumber}
        currentStage={currentStage}
        stageProgress={stageProgress}
        pipelineStatus={pipelineStatus}
      />

      <Grid cols={2} gap={20}>
        {/* Recent runs table with live first row */}
        <Card>
          <CardHeader
            title="Recent Pipeline Runs"
            right={
              <Btn variant="outline" style={{ padding: '4px 12px', fontSize: '0.75rem' }}
                onClick={() => onNavigate('pipelines')}>View All</Btn>
            }
          />
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>{['Build', 'Branch', 'Status', 'Duration'].map(h => (
                <th key={h} style={{ padding: '9px 20px', textAlign: 'left', fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {/* Live current build row */}
              <tr style={{ background: 'rgba(0,229,255,0.04)' }}>
                <td style={{ padding: '12px 20px', fontFamily: 'var(--font-mono)', fontSize: '0.84rem', borderBottom: '1px solid rgba(31,45,69,0.6)' }}>
                  #{buildNumber}
                </td>
                <td style={{ padding: '12px 20px', fontSize: '0.84rem', borderBottom: '1px solid rgba(31,45,69,0.6)' }}>main</td>
                <td style={{ padding: '12px 20px', borderBottom: '1px solid rgba(31,45,69,0.6)' }}>
                  <Badge status={pipelineStatus === 'success' ? 'success' : 'running'}>
                    {pipelineStatus === 'success' ? 'Passed' : 'Running'}
                  </Badge>
                </td>
                <td style={{ padding: '12px 20px', fontSize: '0.84rem', fontFamily: 'var(--font-mono)', color: 'var(--accent)', borderBottom: '1px solid rgba(31,45,69,0.6)' }}>
                  {formatTime(liveTime)}
                </td>
              </tr>
              {/* Static history rows */}
              {pipelineRuns.slice(0, 4).map((r, i) => (
                <tr key={r.id}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '12px 20px', fontFamily: 'var(--font-mono)', fontSize: '0.84rem', borderBottom: i < 3 ? '1px solid rgba(31,45,69,0.4)' : 'none' }}>{r.id}</td>
                  <td style={{ padding: '12px 20px', fontSize: '0.84rem', borderBottom: i < 3 ? '1px solid rgba(31,45,69,0.4)' : 'none' }}>{r.branch}</td>
                  <td style={{ padding: '12px 20px', borderBottom: i < 3 ? '1px solid rgba(31,45,69,0.4)' : 'none' }}><Badge status={r.status}>{statusLabel(r.status)}</Badge></td>
                  <td style={{ padding: '12px 20px', fontSize: '0.84rem', color: 'var(--muted)', borderBottom: i < 3 ? '1px solid rgba(31,45,69,0.4)' : 'none' }}>{r.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* Notifications */}
        <Card style={{ overflow: 'visible' }}>
          <CardHeader title="Notifications" right={<Badge status="running">Live</Badge>} />
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {/* Live notification for current build */}
            <NotifItem
              icon={pipelineStatus === 'success' ? '✅' : '⚙️'}
              title={pipelineStatus === 'success' ? `Build #${buildNumber} Passed!` : `Build #${buildNumber} Running...`}
              desc={`Stage: ${['commit','fetch','build','test','deploy','analyze','recovery','report'][currentStage]} • ${formatTime(liveTime)}`}
              type={pipelineStatus === 'success' ? 'success' : 'info'}
            />
            {notifications.map((n, i) => (
              <NotifItem key={i} icon={n.icon} title={n.title} desc={n.desc} type={n.type} />
            ))}
          </div>
        </Card>
      </Grid>

      {/* System health bar */}
      <Card>
        <CardHeader title="System Health" right={
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--success)' }}>
            Uptime: {uptimePct}%
          </span>
        } />
        <div style={{ padding: '12px 20px 16px', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 }}>
          {[
            { label: 'EC2 Backend',    pct: 98, color: 'var(--success)' },
            { label: 'Docker Engine',  pct: 95, color: 'var(--success)' },
            { label: 'GitHub Webhook', pct: 100, color: 'var(--success)' },
            { label: 'PostgreSQL DB',  pct: 99, color: 'var(--success)' },
          ].map(s => (
            <div key={s.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.76rem' }}>
                <span style={{ color: 'var(--muted)' }}>{s.label}</span>
                <span style={{ color: s.color, fontFamily: 'var(--font-mono)' }}>{s.pct}%</span>
              </div>
              <div style={{ background: 'var(--bg)', borderRadius: 4, height: 5, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${s.pct}%`, background: s.color, borderRadius: 4 }} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
