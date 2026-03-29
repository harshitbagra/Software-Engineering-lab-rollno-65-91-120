import React from 'react'
import { Card, CardHeader, Badge, Btn, ProgressBar, Grid } from '../components/UI'
import { failures, failureDistribution } from '../data/mockData'

export default function Failures({ showToast }) {
  return (
    <div className="page-enter">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.03em' }}>Failure Analyzer</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: 4, fontFamily: 'var(--font-mono)' }}>// intelligent failure detection & classification</p>
      </div>

      <Grid cols={2} gap={20}>
        {/* Distribution */}
        <Card>
          <CardHeader title="Failure Type Distribution" />
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {failureDistribution.map(f => (
              <div key={f.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.83rem' }}>
                  <span>{f.label}</span>
                  <span style={{ color: f.color, fontWeight: 700 }}>{f.pct}%</span>
                </div>
                <ProgressBar pct={f.pct} color={f.color} />
              </div>
            ))}
          </div>
        </Card>

        {/* Recent failures table */}
        <Card>
          <CardHeader title="Recent Failures" />
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>{['Build', 'Stage', 'Type', 'Action'].map(h => (
                <th key={h} style={{ padding: '9px 20px', textAlign: 'left', fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {failures.map((f, i) => (
                <tr key={f.build}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '13px 20px', fontFamily: 'var(--font-mono)', fontSize: '0.84rem', borderBottom: i < failures.length - 1 ? '1px solid rgba(31,45,69,0.5)' : 'none' }}>{f.build}</td>
                  <td style={{ padding: '13px 20px', fontSize: '0.84rem', borderBottom: i < failures.length - 1 ? '1px solid rgba(31,45,69,0.5)' : 'none' }}>{f.stage}</td>
                  <td style={{ padding: '13px 20px', borderBottom: i < failures.length - 1 ? '1px solid rgba(31,45,69,0.5)' : 'none' }}>
                    <Badge status={f.type === 'Timeout' ? 'warning' : 'danger'}>{f.type}</Badge>
                  </td>
                  <td style={{ padding: '13px 20px', borderBottom: i < failures.length - 1 ? '1px solid rgba(31,45,69,0.5)' : 'none' }}>
                    {f.action === 'retry'
                      ? <Btn variant="danger" style={{ padding: '3px 9px', fontSize: '0.7rem' }} onClick={() => showToast('Retrying ' + f.build + '...', 'info', '🔄')}>Retry</Btn>
                      : f.action === 'rollback'
                      ? <Btn variant="outline" style={{ padding: '3px 9px', fontSize: '0.7rem' }} onClick={() => showToast('Rolling back ' + f.build, 'warning', '⏪')}>Rollback</Btn>
                      : <Btn variant="outline" style={{ padding: '3px 9px', fontSize: '0.7rem' }}>View</Btn>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </Grid>

      {/* Failure summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
        {[
          { label: 'Total Failures (30d)', value: '23', color: 'var(--danger)'  },
          { label: 'Auto-Recovered',       value: '18', color: 'var(--success)' },
          { label: 'Manual Intervention',  value: '5',  color: 'var(--warning)' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: 8, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
