import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { store } from './store';
import { LoginForm, RegisterForm, ProtectedRoute } from './components/auth';
import { 
  HomePage, 
  DashboardPage, 
  ProfilePage, 
  BMIDashboard, 
  ProfileSettings, 
  MealsDashboard, 
  DietPlanPage, 
  TrackingPage 
} from './pages';
import { ThemeProvider } from './hooks/useTheme';
import { ThemeDebug } from './components/theme/ThemeDebug';
import Layout from './components/layout/Layout';

// Create a query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="system">
          <Router>
            <Layout title="iHealth BMI">
              {/* Debug component - remove in production */}
              {/* <ThemeDebug position="top-right" /> */}
              
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginForm />} />
                <Route path="/register" element={<RegisterForm />} />
                
                {/* Protected routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile/settings"
                  element={
                    <ProtectedRoute>
                      <ProfileSettings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/bmi"
                  element={
                    <ProtectedRoute>
                      <BMIDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/meals"
                  element={
                    <ProtectedRoute>
                      <MealsDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/diet-plan"
                  element={
                    <ProtectedRoute>
                      <DietPlanPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tracking"
                  element={
                    <ProtectedRoute>
                      <TrackingPage />
                    </ProtectedRoute>
                  }
                />
                
                {/* Catch all route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          </Router>
        </ThemeProvider>
      </QueryClientProvider>
    </Provider>
  );
};

export default App;
