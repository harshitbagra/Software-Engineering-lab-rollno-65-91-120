import React, { useState } from 'react'
import { Card, CardHeader, Badge, Btn, Select } from '../components/UI'
import { pipelineRuns } from '../data/mockData'

function statusLabel(s) {
  return { running: 'Running', success: 'Passed', failed: 'Failed', warning: 'Retried' }[s] || s
}

export default function Pipelines({ onRunPipeline, showToast, onNavigate }) {
  const [filter, setFilter] = useState('All Branches')

  const filtered = filter === 'All Branches'
    ? pipelineRuns
    : pipelineRuns.filter(r => r.branch.startsWith(filter === 'feature/*' ? 'feature' : filter))

  return (
    <div className="page-enter">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.03em' }}>Pipelines</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: 4, fontFamily: 'var(--font-mono)' }}>// all pipeline execution history</p>
      </div>

      <Card>
        <CardHeader
          title="All Runs"
          right={
            <>
              <Select value={filter} onChange={e => setFilter(e.target.value)}
                options={['All Branches', 'main', 'dev', 'feature/*']} />
              <Btn variant="primary" onClick={onRunPipeline}>▶ New Run</Btn>
            </>
          }
        />
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>{['Build #', 'Branch', 'Commit', 'Triggered By', 'Status', 'Duration', 'Action'].map(h => (
              <th key={h} style={{ padding: '9px 20px', textAlign: 'left', fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => (
              <tr key={r.id}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding: '13px 20px', fontFamily: 'var(--font-mono)', fontSize: '0.84rem', borderBottom: i < filtered.length - 1 ? '1px solid rgba(31,45,69,0.5)' : 'none' }}>{r.id}</td>
                <td style={{ padding: '13px 20px', fontSize: '0.84rem', borderBottom: i < filtered.length - 1 ? '1px solid rgba(31,45,69,0.5)' : 'none' }}>{r.branch}</td>
                <td style={{ padding: '13px 20px', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--muted)', borderBottom: i < filtered.length - 1 ? '1px solid rgba(31,45,69,0.5)' : 'none' }}>{r.commit}</td>
                <td style={{ padding: '13px 20px', fontSize: '0.84rem', borderBottom: i < filtered.length - 1 ? '1px solid rgba(31,45,69,0.5)' : 'none' }}>{r.trigger}</td>
                <td style={{ padding: '13px 20px', borderBottom: i < filtered.length - 1 ? '1px solid rgba(31,45,69,0.5)' : 'none' }}><Badge status={r.status}>{statusLabel(r.status)}</Badge></td>
                <td style={{ padding: '13px 20px', fontSize: '0.84rem', color: 'var(--muted)', borderBottom: i < filtered.length - 1 ? '1px solid rgba(31,45,69,0.5)' : 'none' }}>{r.duration}</td>
                <td style={{ padding: '13px 20px', borderBottom: i < filtered.length - 1 ? '1px solid rgba(31,45,69,0.5)' : 'none' }}>
                  {r.status === 'failed'
                    ? <Btn variant="danger" style={{ padding: '4px 10px', fontSize: '0.72rem' }} onClick={() => showToast('Retrying build ' + r.id + '...', 'info', '🔄')}>Retry</Btn>
                    : <Btn variant="outline" style={{ padding: '4px 10px', fontSize: '0.72rem' }} onClick={() => onNavigate('logs')}>Logs</Btn>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
