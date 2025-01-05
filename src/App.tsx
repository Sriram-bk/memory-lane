import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './features/Auth/AuthContext'
import { AuthPage } from './pages/AuthPage'
import { useAuthContext } from './features/Auth/AuthContext'
import { MemoryLanePage } from './pages/MemoryLanePage'
import { SharedMemoryLanePage } from './pages/SharedMemoryLanePage'
import './App.css'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthContext()
  return isAuthenticated ? <>{children}</> : <Navigate to="/auth" replace />
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/shared/:token" element={<SharedMemoryLanePage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MemoryLanePage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App
