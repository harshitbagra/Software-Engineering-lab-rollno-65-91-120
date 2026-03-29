import React from 'react'

/* ── BADGE ── */
export function Badge({ status, children }) {
  const map = {
    success: { bg: 'rgba(16,185,129,0.15)', color: 'var(--success)', border: 'rgba(16,185,129,0.3)' },
    danger:  { bg: 'rgba(239,68,68,0.15)',  color: 'var(--danger)',  border: 'rgba(239,68,68,0.3)'  },
    warning: { bg: 'rgba(245,158,11,0.15)', color: 'var(--warning)', border: 'rgba(245,158,11,0.3)' },
    running: { bg: 'rgba(0,229,255,0.12)',  color: 'var(--accent)',  border: 'rgba(0,229,255,0.25)' },
    info:    { bg: 'rgba(0,229,255,0.12)',  color: 'var(--accent)',  border: 'rgba(0,229,255,0.25)' },
  }
  const s = map[status] || map.info
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '3px 10px', borderRadius: 20,
      fontSize: '0.7rem', fontFamily: 'var(--font-mono)',
      fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase',
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor',
        ...(status === 'running' ? { animation: 'pulse 1.5s infinite' } : {}) }} />
      {children}
    </span>
  )
}

/* ── STAT CARD ── */
export function StatCard({ label, value, sub, color, accentColor }) {
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 12, padding: 20, position: 'relative', overflow: 'hidden',
      transition: 'transform 0.2s, border-color 0.2s', cursor: 'default',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = 'rgba(0,229,255,0.2)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--border)' }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: accentColor }} />
      <div style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
      <div style={{ fontSize: '2rem', fontWeight: 800, margin: '8px 0 4px', letterSpacing: '-0.04em', color }}>{value}</div>
      <div style={{ fontSize: '0.74rem', color: 'var(--muted)' }}>{sub}</div>
    </div>
  )
}

/* ── CARD ── */
export function Card({ children, style = {} }) {
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 12, overflow: 'hidden', marginBottom: 24, ...style
    }}>
      {children}
    </div>
  )
}

export function CardHeader({ title, right }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 20px', borderBottom: '1px solid var(--border)',
    }}>
      <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{title}</span>
      {right && <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>{right}</div>}
    </div>
  )
}

/* ── BUTTON ── */
export function Btn({ children, variant = 'primary', onClick, style = {}, fullWidth }) {
  const variants = {
    primary: {
      background: 'linear-gradient(135deg, var(--accent), #0080ff)',
      color: '#000', border: 'none',
    },
    outline: {
      background: 'transparent', color: 'var(--text)',
      border: '1px solid var(--border)',
    },
    danger: {
      background: 'rgba(239,68,68,0.12)', color: 'var(--danger)',
      border: '1px solid rgba(239,68,68,0.25)',
    },
  }
  const base = variants[variant] || variants.primary
  return (
    <button onClick={onClick} style={{
      padding: '7px 16px', borderRadius: 8,
      fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.82rem',
      cursor: 'pointer', transition: 'all 0.2s',
      width: fullWidth ? '100%' : undefined,
      ...base, ...style,
    }}
      onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; e.currentTarget.style.transform = 'translateY(-1px)' }}
      onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)' }}
    >
      {children}
    </button>
  )
}

/* ── TABLE ── */
export function DataTable({ headers, rows }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          {headers.map(h => (
            <th key={h} style={{
              padding: '10px 20px', textAlign: 'left',
              fontSize: '0.66rem', fontFamily: 'var(--font-mono)',
              color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em',
              background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)',
            }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            {row.map((cell, j) => (
              <td key={j} style={{
                padding: '13px 20px', fontSize: '0.85rem',
                borderBottom: i < rows.length - 1 ? '1px solid rgba(31,45,69,0.6)' : 'none',
              }}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

/* ── PROGRESS BAR ── */
export function ProgressBar({ pct, color }) {
  return (
    <div style={{ background: 'var(--bg)', borderRadius: 4, height: 6, overflow: 'hidden' }}>
      <div style={{ height: '100%', borderRadius: 4, width: `${pct}%`, background: color, transition: 'width 0.5s ease' }} />
    </div>
  )
}

/* ── FORM FIELD ── */
export function FormField({ label, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: 'block', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </label>
      {children}
    </div>
  )
}

export function Input({ value, onChange, type = 'text', placeholder }) {
  return (
    <input type={type} value={value} onChange={onChange} placeholder={placeholder}
      style={{
        width: '100%', padding: '10px 14px',
        background: 'var(--bg)', border: '1px solid var(--border)',
        borderRadius: 8, color: 'var(--text)',
        fontFamily: 'var(--font-mono)', fontSize: '0.84rem',
        outline: 'none', transition: 'border-color 0.2s',
      }}
      onFocus={e => e.target.style.borderColor = 'var(--accent)'}
      onBlur={e => e.target.style.borderColor = 'var(--border)'}
    />
  )
}

export function Select({ value, onChange, options }) {
  return (
    <select value={value} onChange={onChange} style={{
      width: '100%', padding: '10px 14px',
      background: 'var(--bg)', border: '1px solid var(--border)',
      borderRadius: 8, color: 'var(--text)',
      fontFamily: 'var(--font-mono)', fontSize: '0.84rem', cursor: 'pointer',
    }}>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  )
}

/* ── NOTIF ITEM ── */
export function NotifItem({ icon, title, desc, type }) {
  const colors = { success: 'var(--success)', danger: 'var(--danger)', warning: 'var(--warning)', info: 'var(--accent)' }
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 12,
      padding: '12px 16px', background: 'var(--surface2)', borderRadius: 8,
      borderLeft: `3px solid ${colors[type] || colors.info}`,
    }}>
      <span style={{ fontSize: '1rem', marginTop: 1 }}>{icon}</span>
      <div>
        <div style={{ fontWeight: 700, fontSize: '0.84rem', marginBottom: 2 }}>{title}</div>
        <div style={{ color: 'var(--muted)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>{desc}</div>
      </div>
    </div>
  )
}

/* ── PAGE HEADER ── */
export function PageHeader({ title, sub }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.03em' }}>{title}</h1>
      <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: 4, fontFamily: 'var(--font-mono)' }}>{sub}</p>
    </div>
  )
}

/* ── GRID ── */
export function Grid({ cols = 2, children, gap = 20 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap, marginBottom: 24 }}>
      {children}
    </div>
  )
}
