import { useState } from 'react';
import { Ambulance, Lock, User, ArrowLeft, AlertCircle } from 'lucide-react';

interface RescuerLoginProps {
  onLogin: (rescuerId: string, password: string) => boolean;
  onBack: () => void;
}

export function RescuerLogin({ onLogin, onBack }: RescuerLoginProps) {
  const [rescuerId, setRescuerId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const success = onLogin(rescuerId, password);
    if (!success) {
      setError('Invalid Rescuer ID or Password');
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-700 via-green-800 to-green-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-green-100 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Home</span>
        </button>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center">
              <Ambulance className="w-10 h-10 text-white" />
            </div>
          </div>

          <h2 className="text-center mb-2 text-gray-900">Rescuer Login</h2>
          <p className="text-center text-gray-600 mb-8">Verify your identity to access rescue requests</p>

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
                  <span>Rescuer ID</span>
                </div>
              </label>
              <input
                type="text"
                required
                value={rescuerId}
                onChange={(e) => setRescuerId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                placeholder="Enter your rescuer ID"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 text-white py-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <Ambulance className="w-5 h-5" />
              <span>Login to Rescuer Dashboard</span>
            </button>
          </form>

          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <p className="text-xs text-gray-700 mb-3 text-center">
              <strong>Demo Rescuer Accounts:</strong>
            </p>
            <div className="space-y-2 text-xs text-gray-600">
              <div className="bg-white p-2 rounded">
                <strong>Rescuer 1:</strong> ID: <code className="bg-gray-100 px-1">rescuer1</code> | Password: <code className="bg-gray-100 px-1">rescue123</code>
              </div>
              <div className="bg-white p-2 rounded">
                <strong>Rescuer 2:</strong> ID: <code className="bg-gray-100 px-1">rescuer2</code> | Password: <code className="bg-gray-100 px-1">rescue123</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
