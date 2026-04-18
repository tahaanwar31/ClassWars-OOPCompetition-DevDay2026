/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Round1 from './rounds/round1/Round1';
import Round2 from './rounds/round2/Round2';
import Level2 from './rounds/round2/Level2';
import TeamLogin from './pages/TeamLogin';
import CompetitionLobby from './pages/CompetitionLobby';
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import Questions from './pages/admin/Questions';
import GameConfig from './pages/admin/GameConfig';
import Sessions from './pages/admin/Sessions';
import Teams from './pages/admin/Teams';
import Leaderboard from './pages/admin/Leaderboard';
import Layout from './components/admin/Layout';

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: 'red', backgroundColor: '#000', minHeight: '100vh', fontFamily: 'monospace' }}>
          <h2>Something went wrong.</h2>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{this.state.error?.toString()}</pre>
          <pre style={{ whiteSpace: 'pre-wrap', marginTop: '20px', fontSize: '12px' }}>{this.state.error?.stack}</pre>
        </div>
      );
    }

    return this.props.children;
  }
}

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  return token ? <>{children}</> : <Navigate to="/admin/login" replace />;
};

export default function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          {/* Team Login */}
          <Route path="/" element={<TeamLogin />} />
          
          {/* Competition Routes */}
          <Route path="/competition" element={<CompetitionLobby />} />
          <Route path="/competition/round1" element={<Round1 />} />
          <Route path="/competition/round2" element={<Round2 />} />
          <Route path="/competition/round2/level2" element={<Level2 />} />
          
          {/* Legacy Game Route - redirect to competition lobby */}
          <Route path="/game" element={<Navigate to="/competition" replace />} />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<Login />} />
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="questions" element={<Questions />} />
                    <Route path="config" element={<GameConfig />} />
                    <Route path="sessions" element={<Sessions />} />
                    <Route path="teams" element={<Teams />} />
                    <Route path="leaderboard" element={<Leaderboard />} />
                    <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />
          
          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}
