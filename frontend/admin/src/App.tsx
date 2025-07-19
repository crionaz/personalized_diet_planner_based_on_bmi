import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from './store'
import Layout from './components/Layout/Layout'
import Login from './pages/Auth/Login'
import Dashboard from './pages/Dashboard/Dashboard'
import Users from './pages/Users/Users'
import Settings from './pages/Settings/Settings'
import Profile from './pages/Profile/Profile'
import ProtectedRoute from './components/Auth/ProtectedRoute'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from './hooks/useTheme'
import { AdminThemeDebug } from './components/theme/AdminThemeDebug'

function App() {
  const { user } = useSelector((state: RootState) => state.auth)

  return (
    <ThemeProvider defaultTheme="system">
      <div className="admin-dashboard min-h-screen bg-white dark:bg-dark-900 text-gray-900 dark:text-white transition-colors">
        <Routes>
          <Route 
            path="/login" 
            element={user ? <Navigate to="/dashboard" replace /> : <Login />} 
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/users" element={<Users />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
        <AdminThemeDebug />
      </div>
    </ThemeProvider>
  )
}

export default App
