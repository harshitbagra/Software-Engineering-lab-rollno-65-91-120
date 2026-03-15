import React from 'react'

export default function ToastContainer({ toasts }) {
  const colors = {
    success: 'rgba(16,185,129,0.4)',
    danger:  'rgba(239,68,68,0.4)',
    info:    'rgba(0,229,255,0.3)',
    warning: 'rgba(245,158,11,0.35)',
  }

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24,
      zIndex: 300, display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      {toasts.map(t => (
        <div key={t.id} className="toast-enter" style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '11px 18px', borderRadius: 10,
          background: 'var(--surface2)',
          border: `1px solid ${colors[t.type] || colors.info}`,
          fontSize: '0.84rem', fontWeight: 600,
          minWidth: 260,
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}>
          <span>{t.icon}</span>
          <span>{t.msg}</span>
        </div>
      ))}
    </div>
  )
}
