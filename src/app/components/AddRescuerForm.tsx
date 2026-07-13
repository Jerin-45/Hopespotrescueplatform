import { useState } from 'react';
import { UserPlus, CheckCircle, Copy, Check, User, Phone, MapPin } from 'lucide-react';
import { RescuerAccount } from '../App';

interface AddRescuerFormProps {
  onAddRescuer: (rescuer: RescuerAccount) => void;
}

export function AddRescuerForm({ onAddRescuer }: AddRescuerFormProps) {
  const [rescuerId, setRescuerId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{
    id: string;
    email: string;
    password: string;
  } | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
      } else {
        // Fallback for non-secure contexts (iframe)
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
          document.execCommand('copy');
          setCopiedField(field);
          setTimeout(() => setCopiedField(null), 2000);
        } catch (err) {
          console.error('Fallback: Oops, unable to copy', err);
          alert('Unable to copy automatically. Please select the text and copy manually.');
        }
        
        document.body.removeChild(textArea);
      }
    } catch (err) {
      console.error('Failed to copy: ', err);
      // Try fallback one more time if the main try block failed immediately
      try {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
      } catch (fallbackErr) {
        alert('Unable to copy automatically. Please select the text and copy manually.');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validate rescuer ID format (should be like "name-r#")
    const idPattern = /^[a-z]+-r\d+$/i;
    if (!idPattern.test(rescuerId)) {
      setError('Rescuer ID must be in format: name-r# (e.g., john-r7)');
      return;
    }

    // Validate email
    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    // Validate password
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    // Validate name
    if (!name.trim()) {
      setError('Please enter the rescuer\'s name');
      return;
    }

    // Validate phone
    if (!phone.trim()) {
      setError('Please enter the rescuer\'s phone number');
      return;
    }

    // Validate address
    if (!address.trim()) {
      setError('Please enter the rescuer\'s address');
      return;
    }

    const newRescuer: RescuerAccount = {
      id: rescuerId.toLowerCase(),
      email: email.toLowerCase(),
      password,
      name,
      phone,
      address,
      registeredAt: new Date().toISOString(),
      profileComplete: true,
    };

    onAddRescuer(newRescuer);
    setSuccess(true);
    setCreatedCredentials({
      id: rescuerId.toLowerCase(),
      email: email.toLowerCase(),
      password: password,
    });
    // Credentials will remain visible until "Add Another Rescuer" is clicked
  };

  const handleCreateAnother = () => {
    setRescuerId('');
    setEmail('');
    setPassword('');
    setName('');
    setPhone('');
    setAddress('');
    setSuccess(false);
    setCreatedCredentials(null);
    setError('');
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {success && createdCredentials && (
        <div className="mb-6">
          <div className="p-6 bg-green-50 border-2 border-green-300 rounded-lg mb-4">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h4 className="text-green-900">Rescuer Account Created Successfully!</h4>
            </div>
            <p className="text-green-800 mb-4">Share the following credentials with the rescuer:</p>
            
            <div className="bg-white rounded-lg p-4 space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-blue-900">Quick Share Format</p>
                  <button
                    onClick={() => copyToClipboard(`userid:${createdCredentials.id},password:${createdCredentials.password}`, 'quickShare')}
                    className="flex items-center gap-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded transition-colors"
                  >
                    {copiedField === 'quickShare' ? (
                      <>
                        <Check className="w-3 h-3" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy String</span>
                      </>
                    )}
                  </button>
                </div>
                <code className="block bg-white p-2 rounded border border-blue-100 text-sm text-gray-800 break-all font-mono">
                  userid:{createdCredentials.id},password:{createdCredentials.password}
                </code>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200">
                <div>
                  <p className="text-sm text-gray-600">User ID</p>
                  <p className="text-gray-900">{createdCredentials.id}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(createdCredentials.id, 'id')}
                  className="p-2 hover:bg-gray-200 rounded transition-colors"
                  title="Copy to clipboard"
                >
                  {copiedField === 'id' ? (
                    <Check className="w-5 h-5 text-green-600" />
                  ) : (
                    <Copy className="w-5 h-5 text-gray-600" />
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200">
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="text-gray-900">{createdCredentials.email}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(createdCredentials.email, 'email')}
                  className="p-2 hover:bg-gray-200 rounded transition-colors"
                  title="Copy to clipboard"
                >
                  {copiedField === 'email' ? (
                    <Check className="w-5 h-5 text-green-600" />
                  ) : (
                    <Copy className="w-5 h-5 text-gray-600" />
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200">
                <div>
                  <p className="text-sm text-gray-600">Password</p>
                  <p className="text-gray-900">{createdCredentials.password}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(createdCredentials.password, 'password')}
                  className="p-2 hover:bg-gray-200 rounded transition-colors"
                  title="Copy to clipboard"
                >
                  {copiedField === 'password' ? (
                    <Check className="w-5 h-5 text-green-600" />
                  ) : (
                    <Copy className="w-5 h-5 text-gray-600" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="w-full bg-red-600 text-white py-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
            onClick={handleCreateAnother}
          >
            <UserPlus className="w-5 h-5" />
            <span>Add Another Rescuer</span>
          </button>
        </div>
      )}

      {!createdCredentials && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="rescuerId" className="block mb-2 text-gray-700">
                Rescuer ID *
              </label>
              <input
                type="text"
                id="rescuerId"
                value={rescuerId}
                onChange={(e) => setRescuerId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="e.g., john-r7"
                required
              />
              <p className="mt-1 text-sm text-gray-500">Format: name-r#</p>
            </div>

            <div>
              <label htmlFor="name" className="block mb-2 text-gray-700">
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter full name"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="email" className="block mb-2 text-gray-700">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="rescuer@example.com"
                required
              />
            </div>

            <div>
              <label htmlFor="phone" className="block mb-2 text-gray-700">
                Phone Number *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter phone number"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="address" className="block mb-2 text-gray-700">
              Address *
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Enter full address"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block mb-2 text-gray-700">
              Password *
            </label>
            <input
              type="text"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Enter password"
              required
            />
            <p className="mt-1 text-sm text-gray-500">Share this password with the rescuer</p>
          </div>

          <button
            type="submit"
            className="w-full bg-red-600 text-white py-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
          >
            <UserPlus className="w-5 h-5" />
            <span>Create Rescuer Account</span>
          </button>
        </form>
      )}
    </div>
  );
}