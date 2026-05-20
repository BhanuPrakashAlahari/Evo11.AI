import { Routes, Route, Navigate } from 'react-router-dom'
import DashboardLayout from './layouts/DashboardLayout'
import Dashboard from './pages/Dashboard'
import Tasks from './pages/Tasks'
import TechNews from './pages/TechNews'
import GitHubConsole from './pages/GitHubConsole'

function App() {
  return (
    <DashboardLayout>
      <Routes>
        <Route path="/"         element={<Dashboard />} />
        <Route path="/tasks"    element={<Tasks />} />
        <Route path="/technews" element={<TechNews />} />
        <Route path="/gitHub"   element={<GitHubConsole />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*"         element={<Navigate to="/" replace />} />
      </Routes>
    </DashboardLayout>
  )
}

function Settings() {
  return (
    <div className="space-y-4 animate-fade-in">
      <h1 className="text-3xl font-extrabold tracking-tight text-gradient-saas">Settings</h1>
      <p className="text-sm text-zinc-400">Application configuration coming soon.</p>
    </div>
  )
}

export default App
