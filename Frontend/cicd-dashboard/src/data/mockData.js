// ── MOCK DATA ──────────────────────────────────────────────

export const stats = [
  { label: 'Total Runs',     value: '142', sub: '↑ 12 this week',    color: 'var(--accent)',  accent: 'c-accent'  },
  { label: 'Successful',    value: '119', sub: '83.8% success rate', color: 'var(--success)', accent: 'c-success' },
  { label: 'Failed',        value: '23',  sub: '↓ 5 vs last week',   color: 'var(--danger)',  accent: 'c-danger'  },
  { label: 'Avg Recovery',  value: '1.8m',sub: 'Mean time to recover',color: 'var(--warning)', accent: 'c-warning' },
]

export const pipelineRuns = [
  { id: '#143', branch: 'main',         commit: 'a3f92b1', trigger: 'Developer', status: 'running', duration: '—'      },
  { id: '#142', branch: 'feature/auth', commit: '9e4d21c', trigger: 'Developer', status: 'success', duration: '3m 12s' },
  { id: '#141', branch: 'hotfix/db',    commit: '7c1b8ef', trigger: 'Webhook',   status: 'failed',  duration: '1m 08s' },
  { id: '#140', branch: 'main',         commit: '2a9f3d4', trigger: 'Developer', status: 'success', duration: '2m 55s' },
  { id: '#139', branch: 'dev',          commit: '5f7e9a2', trigger: 'Schedule',  status: 'warning', duration: '4m 01s' },
  { id: '#138', branch: 'main',         commit: '1b3c6d8', trigger: 'Developer', status: 'success', duration: '3m 40s' },
]

export const notifications = [
  { icon: '✅', title: 'Build #142 Passed',              desc: 'feature/auth • 2 mins ago',       type: 'success' },
  { icon: '❌', title: 'Build #141 Failed — Test Stage', desc: 'hotfix/db • Auto-retry initiated', type: 'danger'  },
  { icon: '🔄', title: 'Recovery Success on #139',       desc: 'Rollback completed • 18 mins ago', type: 'info'    },
  { icon: '⚠️', title: 'Docker image pull slow',         desc: 'Deployment latency increased',     type: 'warning' },
]

export const buildHistory = [
  { id: '#143', app: 'myapp-backend', artifact: 'myapp-v1.43.zip', status: 'running', time: '—'  },
  { id: '#142', app: 'myapp-backend', artifact: 'myapp-v1.42.zip', status: 'success', time: '54s' },
  { id: '#141', app: 'myapp-backend', artifact: '—',               status: 'failed',  time: '28s' },
  { id: '#140', app: 'myapp-backend', artifact: 'myapp-v1.40.zip', status: 'success', time: '61s' },
]

export const failures = [
  { build: '#141', stage: 'Test',   type: 'Test Fail',   action: 'retry'    },
  { build: '#138', stage: 'Deploy', type: 'Timeout',     action: 'rollback' },
  { build: '#135', stage: 'Build',  type: 'Compile Err', action: 'view'     },
]

export const failureDistribution = [
  { label: 'Test Failures',  pct: 42, color: 'var(--danger)'  },
  { label: 'Build Errors',   pct: 28, color: 'var(--warning)' },
  { label: 'Deploy Errors',  pct: 18, color: 'var(--accent)'  },
  { label: 'Network Timeout',pct: 12, color: 'var(--success)' },
]

export const recoveryActions = [
  { icon: '🔄', title: 'Auto-Retry on #139',              desc: 'Test stage retried successfully — 18 mins ago',    type: 'success' },
  { icon: '⏪', title: 'Rollback on #137',                desc: 'Deployment rolled back to v1.36 — 2 hrs ago',      type: 'info'    },
  { icon: '⚠️', title: 'Manual Intervention Required #141',desc: 'Max retries exceeded — awaiting admin action',    type: 'warning' },
]

export const weeklyData = [
  { day: 'Mon', passed: 5,  failed: 1 },
  { day: 'Tue', passed: 8,  failed: 0 },
  { day: 'Wed', passed: 4,  failed: 3 },
  { day: 'Thu', passed: 9,  failed: 1 },
  { day: 'Fri', passed: 7,  failed: 2 },
  { day: 'Sat', passed: 3,  failed: 1 },
  { day: 'Sun', passed: 6,  failed: 0 },
]

export const logLines = [
  { time: '09:41:02', cls: 'info',    msg: '[INFO]  Pipeline #143 started — branch: main' },
  { time: '09:41:03', cls: 'info',    msg: '[INFO]  Fetching source from GitHub' },
  { time: '09:41:05', cls: 'success', msg: '[OK]    Source code fetched (312 files)' },
  { time: '09:41:06', cls: 'info',    msg: '[INFO]  Starting build — Python 3.11 / pip install' },
  { time: '09:41:18', cls: 'success', msg: '[OK]    Build completed — artifact: myapp-v1.43.zip' },
  { time: '09:41:20', cls: 'info',    msg: '[INFO]  Running automated test suite (47 tests)' },
  { time: '09:41:35', cls: 'success', msg: '[OK]    Tests 1–35 passed' },
  { time: '09:42:01', cls: 'warning', msg: '[WARN]  Test #36 slow response — retrying...' },
  { time: '09:42:25', cls: 'info',    msg: '[INFO]  Running tests 36–47...' },
]

export const extraLogLines = [
  { time: '09:42:30', cls: 'success', msg: '[OK]    Tests 36–47 all passed (47/47)' },
  { time: '09:42:31', cls: 'info',    msg: '[INFO]  Deploying to Docker container...' },
  { time: '09:42:45', cls: 'success', msg: '[OK]    Container started — port 8080' },
  { time: '09:42:46', cls: 'info',    msg: '[INFO]  Running health check...' },
  { time: '09:42:50', cls: 'success', msg: '[OK]    Health check passed — deployment successful' },
  { time: '09:42:51', cls: 'info',    msg: '[INFO]  Generating pipeline report...' },
  { time: '09:42:52', cls: 'success', msg: '[OK]    Pipeline #143 completed in 1m 50s ✓' },
]

export const pipelineStages = [
  { label: 'Code\nCommit', icon: '📝', status: 'done'    },
  { label: 'Fetch\nSource', icon: '📥', status: 'done'    },
  { label: 'Build',        icon: '🔨', status: 'done'    },
  { label: 'Testing',      icon: '⚙️', status: 'running' },
  { label: 'Deploy',       icon: '🚀', status: 'idle'    },
  { label: 'Analyze',      icon: '🔍', status: 'idle'    },
  { label: 'Recovery',     icon: '🔄', status: 'idle'    },
  { label: 'Report',       icon: '📊', status: 'idle'    },
]
