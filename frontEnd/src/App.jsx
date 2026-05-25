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
        <Route path="/" element={<Dashboard />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/technews" element={<TechNews />} />
        <Route path="/gitHub" element={<GitHubConsole />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </DashboardLayout>
  )
}

export default App
