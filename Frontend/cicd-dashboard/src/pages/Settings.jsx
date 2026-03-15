import React, { useState } from 'react'
import { Card, CardHeader, Btn, FormField, Input, Select, Grid } from '../components/UI'

export default function Settings({ showToast }) {
  const [repoUrl,  setRepoUrl]  = useState('https://github.com/org/myapp')
  const [branch,   setBranch]   = useState('main')
  const [email,    setEmail]    = useState('admin@company.com')
  const [slack,    setSlack]    = useState('')
  const [alertOn,  setAlertOn]  = useState('Failures Only')

  return (
    <div className="page-enter">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.03em' }}>Settings</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: 4, fontFamily: 'var(--font-mono)' }}>// system configuration</p>
      </div>

      <Grid cols={2} gap={20}>
        {/* Git integration */}
        <Card>
          <CardHeader title="Git Integration" />
          <div style={{ padding: 20 }}>
            <FormField label="Repository URL">
              <Input value={repoUrl} onChange={e => setRepoUrl(e.target.value)} />
            </FormField>
            <FormField label="Branch to Watch">
              <Input value={branch} onChange={e => setBranch(e.target.value)} />
            </FormField>
            <FormField label="Webhook Secret">
              <Input type="password" value="••••••••••••" onChange={() => {}} />
            </FormField>
            <Btn variant="primary" onClick={() => showToast('Git settings saved!', 'success', '✅')}>Save</Btn>
          </div>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader title="Notification Settings" />
          <div style={{ padding: 20 }}>
            <FormField label="Email Alerts">
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} />
            </FormField>
            <FormField label="Slack Webhook">
              <Input value={slack} onChange={e => setSlack(e.target.value)} placeholder="https://hooks.slack.com/..." />
            </FormField>
            <FormField label="Alert On">
              <Select value={alertOn} onChange={e => setAlertOn(e.target.value)}
                options={['Failures Only', 'All Events', 'Critical Only']} />
            </FormField>
            <Btn variant="primary" onClick={() => showToast('Notifications configured!', 'success', '🔔')}>Save</Btn>
          </div>
        </Card>
      </Grid>

      {/* Security section */}
      <Card>
        <CardHeader title="Security" />
        <div style={{ padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div>
            <FormField label="Authentication">
              <Select value="JWT Token" onChange={() => {}} options={['JWT Token', 'OAuth2', 'API Key']} />
            </FormField>
            <FormField label="Session Timeout (minutes)">
              <Input type="number" value="60" onChange={() => {}} />
            </FormField>
          </div>
          <div>
            <FormField label="RBAC Role">
              <Select value="Admin" onChange={() => {}} options={['Admin', 'Developer', 'Viewer']} />
            </FormField>
            <FormField label="Encryption">
              <Select value="AES-256" onChange={() => {}} options={['AES-256', 'RSA-2048']} />
            </FormField>
          </div>
        </div>
        <div style={{ padding: '0 20px 20px' }}>
          <Btn variant="primary" onClick={() => showToast('Security settings saved!', 'success', '🔒')}>Save Security Settings</Btn>
        </div>
      </Card>
    </div>
  )
}
