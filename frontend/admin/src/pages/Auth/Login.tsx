import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import { RootState, AppDispatch } from '../../store'
import { useAuth } from '../../hooks/useAuth'
import { clearError } from '../../store/slices/authSlice'
import toast from 'react-hot-toast'
import { Button, Input, Card, CardContent } from '../../components/ui'
import { ThemeToggle } from '../../components/theme/ThemeComponents'

const Login: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const dispatch = useDispatch<AppDispatch>()
  const { user, isLoading, error } = useSelector((state: RootState) => state.auth)
  const { login } = useAuth()

  React.useEffect(() => {
    if (error) {
      toast.error(error)
      dispatch(clearError())
    }
  }, [error, dispatch])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast.error('Please fill in all fields')
      return
    }

    try {
      console.log('Starting login process...')
      const result = await login({ email, password })
      console.log('Login result:', result)
      toast.success('Login successful!')
    } catch (error: any) {
      console.error('Login error:', error)
      toast.error(error.message || 'Login failed')
    }
  }

  // Debug current state
  console.log('Current auth state:', { user, isLoading, error })

  if (user) {
    console.log('User found, redirecting to dashboard...')
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      {/* Theme Toggle - positioned absolutely for easy access */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      
      <div className="max-w-md w-full">
        <Card>
          <CardContent>
            <div className="text-center mb-8">
              <div className="mx-auto h-12 w-12 bg-blue-600 dark:bg-blue-500 rounded-lg flex items-center justify-center mb-4">
                <svg 
                  className="h-6 w-6 text-white" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" 
                  />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Admin Dashboard
              </h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Sign in to access the admin dashboard
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Email address"
                type="email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                autoComplete="email"
                required
                leftIcon={
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                    />
                  </svg>
                }
              />

              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                leftIcon={
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 0h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                }
              />

              <Button
                type="submit"
                className="w-full"
                loading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign in to Admin Panel'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Admin access only. Contact system administrator for credentials.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Login
