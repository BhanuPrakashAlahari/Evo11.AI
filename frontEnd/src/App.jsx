import DashboardLayout from './layouts/DashboardLayout'
import Dashboard from './pages/Dashboard'

/**
 * Main App Shell.
 * Integrates our scalable layouts and rendering contexts cleanly.
 */
function App() {
  return (
    <DashboardLayout>
      <Dashboard />
    </DashboardLayout>
  )
}

export default App
