import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';

export default function Login() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'KingPere2022$') {
      localStorage.setItem('isAuthenticated', 'true');
      navigate('/dashboard');
    } else {
      setError('Invalid password');
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F4F7] flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-xl max-w-sm w-full animate-in fade-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-orange-600 text-white rounded-xl flex items-center justify-center mb-4 shadow-sm">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Admin Access</h1>
          <p className="text-sm text-gray-500 mt-1">Enter password to manage inventory.</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
              placeholder="••••••••"
              autoFocus
            />
            {error && (
              <p className="text-xs font-semibold text-red-500 mt-2">{error}</p>
            )}
          </div>
          <button
            type="submit"
            className="w-full bg-black text-white font-bold py-3 px-4 rounded-xl shadow-xs hover:bg-gray-800 transition-colors"
          >
            Authenticate
          </button>
        </form>
      </div>
    </div>
  );
}
