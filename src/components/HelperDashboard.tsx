import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, MapPin, Phone, FileText, Image, Clock, Upload, Loader } from 'lucide-react';
import { RescueRequest } from '../App';
import { Header } from './Header';

interface HelperDashboardProps {
  onBack: () => void;
  onSubmitRequest: (request: Omit<RescueRequest, 'id' | 'timestamp' | 'status'>) => void;
  requests: RescueRequest[];
}

export function HelperDashboard({ onBack, onSubmitRequest, requests }: HelperDashboardProps) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    helperName: '',
    helperPhone: '',
    helperAltPhone: '',
    helperEmail: '',
    location: '',
    photoUrl: '',
    notes: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState('');

  // Auto-detect location when form is opened
  useEffect(() => {
    if (showForm && !formData.location) {
      getCurrentLocation();
    }
  }, [showForm]);

  const getCurrentLocation = () => {
    setLoadingLocation(true);
    setLocationError('');

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      setLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Use reverse geocoding to get address
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          
          const address = data.display_name || `${latitude}, ${longitude}`;
          setFormData({ ...formData, location: address });
          setLoadingLocation(false);
        } catch (error) {
          // If reverse geocoding fails, just use coordinates
          setFormData({ ...formData, location: `${latitude}, ${longitude}` });
          setLoadingLocation(false);
        }
      },
      (error) => {
        setLocationError('Unable to retrieve your location. Please enter manually.');
        setLoadingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setFormData({ ...formData, photoUrl: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitRequest(formData);
    setFormData({
      helperName: '',
      helperPhone: '',
      helperAltPhone: '',
      helperEmail: '',
      location: '',
      photoUrl: '',
      notes: '',
    });
    setSelectedFile(null);
    setImagePreview('');
    setShowForm(false);
  };

  const getStatusColor = (status: RescueRequest['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'assigned':
        return 'bg-blue-100 text-blue-800';
      case 'on-the-way':
        return 'bg-purple-100 text-purple-800';
      case 'reached':
        return 'bg-orange-100 text-orange-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: RescueRequest['status']) => {
    switch (status) {
      case 'pending':
        return 'Pending Review';
      case 'assigned':
        return 'Rescuer Assigned';
      case 'on-the-way':
        return 'Rescuer On The Way';
      case 'reached':
        return 'Rescuer Reached Location';
      case 'completed':
        return 'Rescue Completed';
      default:
        return status;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) {
      return `${diffMins} minutes ago`;
    } else if (diffMins < 1440) {
      return `${Math.floor(diffMins / 60)} hours ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header variant="gradient" />
      
      {/* Page Header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={onBack}
            className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <h2 className="text-white mb-2">Helper Dashboard</h2>
          <p className="text-red-100">Submit and track rescue requests</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Submit New Request Button */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="w-full md:w-auto flex items-center justify-center gap-3 bg-red-600 text-white px-8 py-4 rounded-lg hover:bg-red-700 transition-colors shadow-lg mb-8"
          >
            <Plus className="w-6 h-6" />
            <span>Submit New Rescue Request</span>
          </button>
        )}

        {/* Submission Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-gray-900">Submit Rescue Request</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    <span>Your Name</span>
                  </div>
                </label>
                <input
                  type="text"
                  required
                  value={formData.helperName}
                  onChange={(e) => setFormData({ ...formData, helperName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Phone className="w-5 h-5" />
                    <span>Your Phone Number</span>
                  </div>
                </label>
                <input
                  type="tel"
                  required
                  value={formData.helperPhone}
                  onChange={(e) => setFormData({ ...formData, helperPhone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+1234567890"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Phone className="w-5 h-5" />
                    <span>Alternative Phone Number (Optional)</span>
                  </div>
                </label>
                <input
                  type="tel"
                  value={formData.helperAltPhone}
                  onChange={(e) => setFormData({ ...formData, helperAltPhone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+1234567890"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    <span>Email Address (Optional)</span>
                  </div>
                </label>
                <input
                  type="email"
                  value={formData.helperEmail}
                  onChange={(e) => setFormData({ ...formData, helperEmail: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    <span>Incident Address</span>
                  </div>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Auto-detecting your location..."
                  />
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    disabled={loadingLocation}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {loadingLocation ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        <span className="hidden md:inline">Detecting...</span>
                      </>
                    ) : (
                      <>
                        <MapPin className="w-5 h-5" />
                        <span className="hidden md:inline">Refresh Location</span>
                      </>
                    )}
                  </button>
                </div>
                {loadingLocation && !locationError && (
                  <p className="text-sm text-blue-600 mt-2 flex items-center gap-2">
                    <Loader className="w-4 h-4 animate-spin" />
                    Automatically detecting your current location...
                  </p>
                )}
                {locationError && (
                  <p className="text-sm text-red-600 mt-2">{locationError}</p>
                )}
                {formData.location && !loadingLocation && !locationError && (
                  <p className="text-sm text-green-600 mt-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Location detected successfully
                  </p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Image className="w-5 h-5" />
                    <span>Upload Photo (Optional)</span>
                  </div>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label htmlFor="photo-upload" className="cursor-pointer">
                    {imagePreview ? (
                      <div className="space-y-3">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="max-h-48 mx-auto rounded-lg"
                        />
                        <p className="text-sm text-gray-600">Click to change image</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                        <div>
                          <p className="text-gray-700">Click to upload an image</p>
                          <p className="text-sm text-gray-500 mt-1">PNG, JPG up to 10MB</p>
                        </div>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    <span>Additional Notes</span>
                  </div>
                </label>
                <textarea
                  required
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Describe the situation, person's condition, any visible injuries, etc."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-red-600 text-white py-4 rounded-lg hover:bg-red-700 transition-colors"
              >
                Submit Rescue Request
              </button>
            </form>
          </div>
        )}

        {/* My Requests */}
        <div>
          <h2 className="mb-6 text-gray-900">My Submitted Requests</h2>
          
          {requests.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <p className="text-gray-500">No requests submitted yet</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {requests.map((request) => (
                <div key={request.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-gray-900">{request.helperName}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(request.status)}`}>
                          {getStatusText(request.status)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <Clock className="w-4 h-4" />
                        <span>{formatTime(request.timestamp)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="text-gray-900">{request.location}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Phone className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="text-gray-900">{request.helperPhone}</p>
                      </div>
                    </div>

                    {request.helperAltPhone && (
                      <div className="flex items-start gap-2">
                        <Phone className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Alt. Phone</p>
                          <p className="text-gray-900">{request.helperAltPhone}</p>
                        </div>
                      </div>
                    )}

                    {request.helperEmail && (
                      <div className="flex items-start gap-2">
                        <FileText className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="text-gray-900">{request.helperEmail}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start gap-2">
                      <FileText className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Notes</p>
                        <p className="text-gray-900">{request.notes}</p>
                      </div>
                    </div>

                    {request.photoUrl && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-500 mb-2">Uploaded Photo</p>
                        <img
                          src={request.photoUrl}
                          alt="Rescue situation"
                          className="max-h-64 rounded-lg border border-gray-200"
                        />
                      </div>
                    )}

                    {request.assignedRescuer && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-900">
                          <strong>Assigned Rescuer:</strong> {request.assignedRescuer}
                        </p>
                      </div>
                    )}

                    {request.rescuerNotes && (
                      <div className="mt-4 p-4 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-900">
                          <strong>Rescuer Notes:</strong> {request.rescuerNotes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}