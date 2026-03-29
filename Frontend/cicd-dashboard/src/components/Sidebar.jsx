import React from 'react'

const sections = [
  {
    label: 'Main',
    items: [
      { id: 'dashboard', icon: '📊', label: 'Dashboard'  },
      { id: 'pipelines', icon: '🔁', label: 'Pipelines'  },
      { id: 'builds',    icon: '🔨', label: 'Builds'     },
      { id: 'logs',      icon: '📋', label: 'Logs'       },
    ],
  },
  {
    label: 'Recovery',
    items: [
      { id: 'failures', icon: '⚠️', label: 'Failures'  },
      { id: 'recovery', icon: '🔄', label: 'Recovery'  },
    ],
  },
  {
    label: 'Admin',
    items: [
      { id: 'reports',  icon: '📈', label: 'Reports'  },
      { id: 'settings', icon: '⚙️', label: 'Settings' },
    ],
  },
]

export default function Sidebar({ active, onNavigate }) {
  return (
    <aside style={{
      width: 220, flexShrink: 0,
      background: 'var(--surface)',
      borderRight: '1px solid var(--border)',
      padding: '24px 0',
      display: 'flex', flexDirection: 'column', gap: 4,
      position: 'relative', zIndex: 1,
    }}>
      {sections.map(section => (
        <div key={section.label}>
          <div style={{
            padding: '8px 20px 4px',
            fontSize: '0.62rem', fontFamily: 'var(--font-mono)',
            color: 'var(--muted)', letterSpacing: '0.12em', textTransform: 'uppercase',
          }}>{section.label}</div>

          {section.items.map(item => {
            const isActive = active === item.id
            return (
              <div key={item.id}
                onClick={() => onNavigate(item.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 20px', cursor: 'pointer',
                  fontSize: '0.87rem', fontWeight: 600,
                  color: isActive ? 'var(--accent)' : 'var(--muted)',
                  borderLeft: `3px solid ${isActive ? 'var(--accent)' : 'transparent'}`,
                  background: isActive ? 'rgba(0,229,255,0.06)' : 'transparent',
                  transition: 'all 0.18s',
                }}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)' } }}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.color = 'var(--muted)'; e.currentTarget.style.background = 'transparent' } }}
              >
                <span style={{ fontSize: '1rem', width: 20, textAlign: 'center' }}>{item.icon}</span>
                {item.label}
              </div>
            )
          })}
        </div>
      ))}
    </aside>
  )
}
