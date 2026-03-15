import React, { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Card, CardHeader, Btn, FormField, Select, Grid } from '../components/UI'
import { weeklyData } from '../data/mockData'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
      <div style={{ fontWeight: 700, marginBottom: 4 }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: p.color }}>
          {p.name}: {p.value}
        </div>
      ))}
    </div>
  )
}

export default function Reports({ showToast }) {
  const [reportType, setReportType] = useState('Pipeline Summary')
  const [dateRange, setDateRange]   = useState('Last 7 days')

  return (
    <div className="page-enter">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.03em' }}>Reports</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: 4, fontFamily: 'var(--font-mono)' }}>// pipeline performance analytics</p>
      </div>

      <Grid cols={2} gap={20}>
        {/* Bar chart */}
        <Card>
          <CardHeader title="Weekly Build Results" />
          <div style={{ padding: '16px 20px 20px' }}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weeklyData} barGap={4}>
                <XAxis dataKey="day" tick={{ fill: 'var(--muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                <Legend wrapperStyle={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--muted)' }} />
                <Bar dataKey="passed" name="Passed" fill="var(--success)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="failed" name="Failed" fill="var(--danger)"  radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div style={{ marginTop: 10, fontFamily: 'var(--font-mono)', fontSize: '0.76rem', color: 'var(--muted)' }}>
              Total: 42 runs &nbsp;•&nbsp; 36 passed &nbsp;•&nbsp; 6 failed
            </div>
          </div>
        </Card>

        {/* Generate report form */}
        <Card>
          <CardHeader title="Generate Report" />
          <div style={{ padding: 20 }}>
            <FormField label="Report Type">
              <Select value={reportType} onChange={e => setReportType(e.target.value)}
                options={['Pipeline Summary', 'Failure Analysis', 'Recovery Statistics', 'Full Audit Log']} />
            </FormField>
            <FormField label="Date Range">
              <Select value={dateRange} onChange={e => setDateRange(e.target.value)}
                options={['Last 7 days', 'Last 30 days', 'Last 90 days']} />
            </FormField>
            <FormField label="Format">
              <Select value="PDF" onChange={() => {}} options={['PDF', 'CSV', 'JSON']} />
            </FormField>
            <Btn variant="primary" fullWidth onClick={() => showToast('Report generated: ' + reportType, 'success', '📊')}>
              Generate Report
            </Btn>
          </div>
        </Card>
      </Grid>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
        {[
          { label: 'Reports Generated', value: '34',   color: 'var(--accent)'  },
          { label: 'Total Pipelines',   value: '142',  color: 'var(--text)'    },
          { label: 'Success Rate',      value: '83.8%',color: 'var(--success)' },
          { label: 'Avg Duration',      value: '2.9m', color: 'var(--warning)' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: '0.67rem', fontFamily: 'var(--font-mono)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</div>
            <div style={{ fontSize: '1.7rem', fontWeight: 800, marginTop: 8, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
