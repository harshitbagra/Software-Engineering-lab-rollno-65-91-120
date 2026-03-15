import React from 'react'
import { Card, CardHeader, Badge, StatCard, ProgressBar, Grid } from '../components/UI'
import { buildHistory } from '../data/mockData'

function statusLabel(s) {
  return { running: 'Building', success: 'Done', failed: 'Failed' }[s] || s
}

export default function Builds() {
  return (
    <div className="page-enter">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.03em' }}>Build Manager</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: 4, fontFamily: 'var(--font-mono)' }}>// build artifacts and status</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard label="Build Success Rate" value="91%" sub="Target: 95%"     color="var(--success)" accentColor="var(--success)" />
        <StatCard label="Avg Build Time"     value="2.4m" sub="Target: < 3 min" color="var(--accent)"  accentColor="var(--accent)"  />
        <StatCard label="Artifacts Stored"   value="87"   sub="Last 30 days"    color="var(--warning)" accentColor="var(--warning)" />
      </div>

      <Card>
        <div style={{ padding: '16px 20px 8px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.82rem' }}>
            <span>Overall Success Rate</span>
            <span style={{ color: 'var(--success)' }}>91%</span>
          </div>
          <ProgressBar pct={91} color="var(--success)" />
        </div>
      </Card>

      <Card>
        <CardHeader title="Build History" />
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>{['Build ID', 'Application', 'Stage', 'Artifact', 'Status', 'Time'].map(h => (
              <th key={h} style={{ padding: '9px 20px', textAlign: 'left', fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {buildHistory.map((b, i) => (
              <tr key={b.id}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding: '13px 20px', fontFamily: 'var(--font-mono)', fontSize: '0.84rem', borderBottom: i < buildHistory.length - 1 ? '1px solid rgba(31,45,69,0.5)' : 'none' }}>{b.id}</td>
                <td style={{ padding: '13px 20px', fontSize: '0.84rem', borderBottom: i < buildHistory.length - 1 ? '1px solid rgba(31,45,69,0.5)' : 'none' }}>{b.app}</td>
                <td style={{ padding: '13px 20px', fontSize: '0.84rem', borderBottom: i < buildHistory.length - 1 ? '1px solid rgba(31,45,69,0.5)' : 'none' }}>Build</td>
                <td style={{ padding: '13px 20px', fontFamily: 'var(--font-mono)', fontSize: '0.76rem', color: 'var(--muted)', borderBottom: i < buildHistory.length - 1 ? '1px solid rgba(31,45,69,0.5)' : 'none' }}>{b.artifact}</td>
                <td style={{ padding: '13px 20px', borderBottom: i < buildHistory.length - 1 ? '1px solid rgba(31,45,69,0.5)' : 'none' }}><Badge status={b.status}>{statusLabel(b.status)}</Badge></td>
                <td style={{ padding: '13px 20px', fontSize: '0.84rem', color: 'var(--muted)', borderBottom: i < buildHistory.length - 1 ? '1px solid rgba(31,45,69,0.5)' : 'none' }}>{b.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
