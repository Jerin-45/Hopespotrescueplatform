import { useState } from 'react';
import { Shield, Lock, User, ArrowLeft, AlertCircle } from 'lucide-react';
import { Header } from './Header';

interface AdminLoginProps {
  onLogin: (adminId: string, password: string) => boolean;
  onBack: () => void;
}

export function AdminLogin({ onLogin, onBack }: AdminLoginProps) {
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const success = onLogin(adminId, password);
    if (!success) {
      setError('Invalid Admin ID or Password');
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Home</span>
        </button>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center">
              <Shield className="w-10 h-10 text-white" />
            </div>
          </div>

          <h2 className="text-center mb-2 text-gray-900">Admin Access</h2>
          <p className="text-center text-gray-600 mb-8">Enter your credentials to continue</p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  <span>Admin ID</span>
                </div>
              </label>
              <input
                type="text"
                required
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="Enter your admin ID"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  <span>Password</span>
                </div>
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gray-900 text-white py-4 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
            >
              <Shield className="w-5 h-5" />
              <span>Login to Admin Dashboard</span>
            </button>
          </form>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 text-center">
              <strong>Demo Credentials:</strong><br />
              Admin ID: admin<br />
              Password: admin123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}