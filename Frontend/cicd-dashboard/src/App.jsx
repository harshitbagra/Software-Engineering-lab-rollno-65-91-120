import React, { useState, useCallback, useEffect } from 'react'
import Topbar          from './components/Topbar'
import Sidebar         from './components/Sidebar'
import RunModal        from './components/RunModal'
import ToastContainer  from './components/ToastContainer'

import Dashboard from './pages/Dashboard'
import Pipelines from './pages/Pipelines'
import Builds    from './pages/Builds'
import Logs      from './pages/Logs'
import Failures  from './pages/Failures'
import Recovery  from './pages/Recovery'
import Reports   from './pages/Reports'
import Settings  from './pages/Settings'

let toastId = 0

const STAGES = ['commit', 'fetch', 'build', 'test', 'deploy', 'analyze', 'recovery', 'report']
const STAGE_DURATIONS = {
  commit: 2000, fetch: 3000, build: 6000,
  test: 8000, deploy: 5000, analyze: 3000, recovery: 2000, report: 2000
}
const STAGE_ICONS = {
  commit:'📝', fetch:'📥', build:'🔨',
  test:'⚙️', deploy:'🚀', analyze:'🔍', recovery:'🔄', report:'📊'
}

export default function App() {
  const [page,           setPage]           = useState('dashboard')
  const [modalOpen,      setModalOpen]      = useState(false)
  const [toasts,         setToasts]         = useState([])
  const [buildNumber,    setBuildNumber]    = useState(143)
  const [currentStage,   setCurrentStage]   = useState(3)
  const [stageProgress,  setStageProgress]  = useState(0)
  const [pipelineStatus, setPipelineStatus] = useState('running')
  const [totalRuns,      setTotalRuns]      = useState(142)
  const [successRuns,    setSuccessRuns]    = useState(119)
  const [failedRuns,     setFailedRuns]     = useState(23)
  const [liveTime,       setLiveTime]       = useState(0)
  const [liveLogs,       setLiveLogs]       = useState([])
  const [buildRunning,   setBuildRunning]   = useState(true)
  const [uptimePct,      setUptimePct]      = useState(99.7)
  const [avgRecovery,    setAvgRecovery]    = useState(1.8)

  // ── TOAST ──
  const showToast = useCallback((msg, type = 'info', icon = '💬') => {
    const id = ++toastId
    setToasts(prev => [...prev, { id, msg, type, icon }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
  }, [])

  // ── LOG APPENDER ──
  const addLiveLog = useCallback((cls, msg) => {
    const time = new Date().toTimeString().slice(0, 8)
    setLiveLogs(prev => [...prev.slice(-60), { time, cls, msg }])
  }, [])

  // ── CLOCK ──
  useEffect(() => {
    if (!buildRunning) return
    const t = setInterval(() => setLiveTime(s => s + 1), 1000)
    return () => clearInterval(t)
  }, [buildRunning])

  // ── UPTIME TICKER ──
  useEffect(() => {
    const t = setInterval(() => {
      setUptimePct(u => parseFloat(Math.min(100, u + (Math.random() * 0.02 - 0.005)).toFixed(1)))
    }, 4000)
    return () => clearInterval(t)
  }, [])

  // ── AUTO LOGS ──
  useEffect(() => {
    if (!buildRunning) return
    const pool = [
      ['info',    '[INFO]  Checking environment variables...'],
      ['success', '[OK]    Environment validated'],
      ['info',    '[INFO]  Installing dependencies...'],
      ['success', '[OK]    Dependencies resolved (312 packages)'],
      ['info',    '[INFO]  Compiling source files...'],
      ['success', '[OK]    Compilation complete — 0 errors'],
      ['info',    '[INFO]  Running unit tests (47 total)...'],
      ['success', '[OK]    Tests 1–20 passed'],
      ['warning', '[WARN]  Test #21 slow response — threshold 2s'],
      ['success', '[OK]    Tests 21–47 passed (47/47)'],
      ['info',    '[INFO]  Building Docker image...'],
      ['success', '[OK]    Docker image built: myapp:latest'],
      ['info',    '[INFO]  Pushing image to registry...'],
      ['success', '[OK]    Image pushed successfully'],
      ['info',    '[INFO]  Starting container on port 8080...'],
      ['success', '[OK]    Container healthy — all checks passed ✓'],
    ]
    let idx = 0
    const t = setInterval(() => {
      if (idx < pool.length) {
        addLiveLog(pool[idx][0], pool[idx][1])
        idx++
      }
    }, 2000)
    return () => clearInterval(t)
  }, [buildRunning, addLiveLog])

  // ── STAGE PROGRESSION ──
  useEffect(() => {
    if (!buildRunning || pipelineStatus !== 'running') return
    const duration = STAGE_DURATIONS[STAGES[currentStage]] || 3000
    const interval = 60
    const increment = (interval / duration) * 100

    const t = setInterval(() => {
      setStageProgress(p => {
        const next = p + increment
        if (next >= 100) {
          clearInterval(t)
          // Move to next stage
          setCurrentStage(prev => {
            const nextStage = prev + 1
            if (nextStage >= STAGES.length) {
              setPipelineStatus('success')
              setBuildRunning(false)
              setSuccessRuns(s => s + 1)
              setTotalRuns(n => n + 1)
              setAvgRecovery(r => parseFloat((r - 0.1).toFixed(1)))
              addLiveLog('success', '[OK]    ✓ Pipeline completed successfully!')
              showToast(`Build #${buildNumber} passed! 🎉`, 'success', '✅')
              setTimeout(() => {
                setBuildNumber(n => n + 1)
                setCurrentStage(0)
                setStageProgress(0)
                setPipelineStatus('running')
                setBuildRunning(true)
                setLiveTime(0)
                setLiveLogs([])
                showToast('New pipeline auto-triggered', 'info', '🚀')
              }, 5000)
              return prev
            }
            const stageName = STAGES[nextStage]
            const msgs = {
              fetch:    ['Fetching source code...', '[INFO]  Fetching from GitHub'],
              build:    ['Build stage started', '[INFO]  Build process started'],
              test:     ['Running 47 automated tests', '[INFO]  Test suite executing...'],
              deploy:   ['Deploying to Docker...', '[INFO]  Deployment in progress'],
              analyze:  ['Analyzing logs...', '[INFO]  Log analysis running'],
              recovery: ['Recovery checks running', '[INFO]  Recovery module active'],
              report:   ['Generating report...', '[INFO]  Building pipeline report'],
            }
            if (msgs[stageName]) {
              showToast(msgs[stageName][0], 'info', STAGE_ICONS[stageName])
              addLiveLog('info', msgs[stageName][1])
            }
            return nextStage
          })
          return 0
        }
        return next
      })
    }, interval)
    return () => clearInterval(t)
  }, [currentStage, buildRunning, pipelineStatus])

  function handleTrigger(branch, env) {
    setBuildNumber(n => n + 1)
    setCurrentStage(0)
    setStageProgress(0)
    setPipelineStatus('running')
    setBuildRunning(true)
    setLiveTime(0)
    setLiveLogs([])
    showToast(`Pipeline triggered on ${branch} → ${env}`, 'info', '🚀')
    setTimeout(() => showToast('Build stage started', 'info', '🔨'), 1200)
  }

  const liveState = {
    buildNumber, currentStage, stageProgress,
    pipelineStatus, totalRuns, successRuns, failedRuns,
    liveTime, liveLogs, uptimePct, avgRecovery, STAGES,
  }

  const pageProps = { showToast, onNavigate: setPage, onRunPipeline: () => setModalOpen(true), liveState }

  const pages = {
    dashboard: <Dashboard {...pageProps} />,
    pipelines: <Pipelines {...pageProps} />,
    builds:    <Builds    {...pageProps} />,
    logs:      <Logs      {...pageProps} />,
    failures:  <Failures  {...pageProps} />,
    recovery:  <Recovery  {...pageProps} />,
    reports:   <Reports   {...pageProps} />,
    settings:  <Settings  {...pageProps} />,
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Topbar onRunPipeline={() => setModalOpen(true)} pipelineStatus={pipelineStatus} buildNumber={buildNumber} />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar active={page} onNavigate={setPage} />
        <main style={{ flex: 1, padding: 32, overflowY: 'auto', position: 'relative', zIndex: 1 }}>
          {pages[page]}
        </main>
      </div>
      <RunModal open={modalOpen} onClose={() => setModalOpen(false)} onTrigger={handleTrigger} />
      <ToastContainer toasts={toasts} />
    </div>
  )
}
