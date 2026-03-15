import React, { useState } from 'react'
import { Card, CardHeader, NotifItem, Btn, FormField, Input, Select, Grid } from '../components/UI'
import { recoveryActions } from '../data/mockData'

export default function Recovery({ showToast }) {
  const [maxRetries, setMaxRetries]   = useState('3')
  const [retryDelay, setRetryDelay]   = useState('30')
  const [fallback, setFallback]       = useState('Rollback Deployment')

  function saveConfig() {
    showToast('Recovery config saved!', 'success', '✅')
  }

  return (
    <div className="page-enter">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.03em' }}>Recovery Manager</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: 4, fontFamily: 'var(--font-mono)' }}>// automated retry & rollback actions</p>
      </div>

      <Grid cols={2} gap={20}>
        {/* Recovery action history */}
        <Card>
          <CardHeader title="Recovery Actions" />
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {recoveryActions.map((r, i) => (
              <NotifItem key={i} icon={r.icon} title={r.title} desc={r.desc} type={r.type} />
            ))}
          </div>
        </Card>

        {/* Config form */}
        <Card>
          <CardHeader title="Recovery Configuration" />
          <div style={{ padding: 20 }}>
            <FormField label="Max Retry Attempts">
              <Input type="number" value={maxRetries} onChange={e => setMaxRetries(e.target.value)} />
            </FormField>
            <FormField label="Retry Delay (seconds)">
              <Input type="number" value={retryDelay} onChange={e => setRetryDelay(e.target.value)} />
            </FormField>
            <FormField label="On Max Retries Exceeded">
              <Select value={fallback} onChange={e => setFallback(e.target.value)}
                options={['Rollback Deployment', 'Notify Admin Only', 'Halt Pipeline']} />
            </FormField>
            <Btn variant="primary" fullWidth onClick={saveConfig}>Save Configuration</Btn>
          </div>
        </Card>
      </Grid>

      {/* Recovery stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
        {[
          { label: 'Total Retries',    value: '31',   color: 'var(--accent)'  },
          { label: 'Successful Retry', value: '24',   color: 'var(--success)' },
          { label: 'Rollbacks',        value: '7',    color: 'var(--warning)' },
          { label: 'Avg MTTR',         value: '1.8m', color: 'var(--danger)'  },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: '0.67rem', fontFamily: 'var(--font-mono)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: 8, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
