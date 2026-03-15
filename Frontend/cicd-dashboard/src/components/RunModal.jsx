import React, { useState } from 'react'
import { Btn, FormField, Input, Select } from './UI'

export default function RunModal({ open, onClose, onTrigger }) {
  const [branch, setBranch]   = useState('main')
  const [env, setEnv]         = useState('Staging')
  const [note, setNote]       = useState('')

  if (!open) return null

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 16, padding: 28, width: 480, maxWidth: '95vw',
        animation: 'fadeUp 0.25s ease both',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
          <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>▶ Trigger New Pipeline Run</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: '1.1rem', cursor: 'pointer' }}>✕</button>
        </div>

        <FormField label="Repository">
          <Input value="https://github.com/org/myapp" onChange={() => {}} />
        </FormField>

        <FormField label="Branch">
          <Select value={branch} onChange={e => setBranch(e.target.value)}
            options={['main', 'dev', 'feature/auth', 'hotfix/db']} />
        </FormField>

        <FormField label="Environment">
          <Select value={env} onChange={e => setEnv(e.target.value)}
            options={['Staging', 'Production', 'Development']} />
        </FormField>

        <FormField label="Trigger Note (optional)">
          <Input value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. manual hotfix deploy..." />
        </FormField>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
          <Btn variant="outline" onClick={onClose}>Cancel</Btn>
          <Btn variant="primary" onClick={() => { onTrigger(branch, env); onClose() }}>▶ Start Pipeline</Btn>
        </div>
      </div>
    </div>
  )
}
