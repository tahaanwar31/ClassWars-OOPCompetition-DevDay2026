import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Terminal, Lock, AlertCircle, KeyRound } from 'lucide-react';
import api from '../../api/axios';
import TacticalBackground from '../../components/TacticalBackground';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', response.data.access_token);
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Authentication failed - Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020502] text-[#39ff14] font-mono flex items-center justify-center p-4 scanlines crt-flicker relative overflow-hidden">
      <TacticalBackground />
      
      <div className="z-10 w-full max-w-md bg-black/80 backdrop-blur-md border-2 border-blue-500/50 shadow-[0_0_50px_rgba(59,130,246,0.15)] relative">
        {/* HUD Corners */}
        <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-blue-500 opacity-70"></div>
        <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-blue-500 opacity-70"></div>
        <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-blue-500 opacity-70"></div>
        <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-blue-500 opacity-70"></div>

        <div className="p-8 md:p-10">
          {/* Header */}
          <div className="flex items-center justify-center mb-6">
            <Shield className="w-16 h-16 text-blue-500 animate-pulse" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-2 tracking-widest text-blue-500" style={{ textShadow: '0 0 20px rgba(59,130,246,0.8)' }}>
            COMMAND CENTER
          </h1>
          <div className="flex items-center justify-center gap-2 mb-8">
            <Terminal className="w-4 h-4 text-blue-500/70" />
            <p className="text-blue-500/70 text-center text-sm tracking-[0.3em]">
              ADMINISTRATOR ACCESS
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-900/30 border-2 border-red-500 text-red-400 px-4 py-3 mb-6 flex items-start gap-3 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-bold tracking-wider mb-1">ACCESS DENIED</div>
                <div className="text-sm">{error}</div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-bold text-blue-500/90 mb-2 tracking-widest">
                ADMIN EMAIL
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500/50" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-black/60 border-2 border-blue-500/50 focus:border-blue-500 focus:shadow-[0_0_20px_rgba(59,130,246,0.3)] text-white placeholder-blue-500/30 outline-none transition-all font-mono"
                  placeholder="Enter admin email..."
                  required
                  autoComplete="off"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-bold text-blue-500/90 mb-2 tracking-widest">
                SECURITY CODE
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500/50" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-black/60 border-2 border-blue-500/50 focus:border-blue-500 focus:shadow-[0_0_20px_rgba(59,130,246,0.3)] text-white placeholder-blue-500/30 outline-none transition-all font-mono"
                  placeholder="Enter access code..."
                  required
                  autoComplete="off"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#001a33] border-2 border-blue-500 text-blue-500 py-4 hover:bg-blue-500 hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg tracking-widest shadow-[0_0_20px_rgba(59,130,246,0.2)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] relative overflow-hidden group"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    AUTHENTICATING...
                  </>
                ) : (
                  <>
                    <Terminal className="w-5 h-5" />
                    [ ACCESS COMMAND CENTER ]
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
            </button>
          </form>

          {/* Team Link */}
          <div className="mt-8 pt-6 border-t border-blue-500/30 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-blue-500/70 hover:text-blue-500 text-sm tracking-widest transition-colors flex items-center justify-center gap-2 mx-auto group"
            >
              <Shield className="w-4 h-4 group-hover:animate-pulse" />
              TEAM LOGIN →
            </button>
          </div>

          {/* Status Bar */}
          <div className="mt-6 text-center text-xs text-blue-500/50 tracking-[0.2em]">
            <div className="flex items-center justify-center gap-2">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
              SECURE CONNECTION ESTABLISHED
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
