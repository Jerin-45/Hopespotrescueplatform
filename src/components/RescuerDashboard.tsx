import { useState } from 'react';
import { ArrowLeft, MapPin, Phone, FileText, Clock, CheckCircle, Navigation } from 'lucide-react';
import { RescueRequest } from '../App';
import { Header } from './Header';

interface RescuerDashboardProps {
  onBack: () => void;
  requests: RescueRequest[];
  onUpdateStatus: (
    id: string,
    status: RescueRequest['status'],
    rescuerData?: { rescuerId: string; assignedRescuer: string; rescuerNotes?: string }
  ) => void;
  rescuerName: string;
  rescuerEmail: string;
}

export function RescuerDashboard({ onBack, requests, onUpdateStatus, rescuerName, rescuerEmail }: RescuerDashboardProps) {
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [rescuerNotes, setRescuerNotes] = useState('');

  // Filter requests that are available or assigned to this rescuer
  const availableRequests = requests.filter(
    (req) => req.status === 'pending' || req.status === 'assigned' || req.status === 'on-the-way' || req.status === 'reached'
  );

  const handleAcceptCase = (id: string) => {
    onUpdateStatus(id, 'assigned', {
      rescuerId: rescuerName,
      assignedRescuer: rescuerName,
    });
    setSelectedRequest(id);
  };

  const handleUpdateStatus = (id: string, status: RescueRequest['status']) => {
    const request = requests.find((r) => r.id === id);
    if (request) {
      onUpdateStatus(id, status, {
        rescuerId: request.rescuerId || rescuerName,
        assignedRescuer: request.assignedRescuer || rescuerName,
      });
    }
  };

  const handleCompleteRescue = (id: string) => {
    const request = requests.find((r) => r.id === id);
    if (request && rescuerNotes) {
      onUpdateStatus(id, 'completed', {
        rescuerId: request.rescuerId || rescuerName,
        assignedRescuer: request.assignedRescuer || rescuerName,
        rescuerNotes,
      });
      setRescuerNotes('');
      setSelectedRequest(null);
    }
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
          <h2 className="text-white mb-2">Rescuer Dashboard</h2>
          <p className="text-red-100">Welcome, {rescuerName}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-500 text-sm mb-1">Pending</p>
            <p className="text-yellow-600">{requests.filter((r) => r.status === 'pending').length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-500 text-sm mb-1">In Progress</p>
            <p className="text-blue-600">
              {requests.filter((r) => r.status === 'assigned' || r.status === 'on-the-way' || r.status === 'reached').length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-500 text-sm mb-1">Completed</p>
            <p className="text-green-600">{requests.filter((r) => r.status === 'completed').length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-500 text-sm mb-1">Total</p>
            <p className="text-gray-900">{requests.length}</p>
          </div>
        </div>

        {/* Active Requests */}
        <div>
          <h2 className="mb-6 text-gray-900">Active Rescue Requests</h2>
          
          {availableRequests.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <p className="text-gray-900 mb-2">All Clear!</p>
              <p className="text-gray-500">No active rescue requests at the moment</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {availableRequests.map((request) => (
                <div
                  key={request.id}
                  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-gray-900">Case #{request.id}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(request.status)}`}>
                          {request.status === 'pending' ? 'New Request' : request.status.replace('-', ' ').toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <Clock className="w-4 h-4" />
                        <span>{formatTime(request.timestamp)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="text-gray-900">{request.location}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Phone className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Helper Contact</p>
                        <p className="text-gray-900">{request.helperName}</p>
                        <p className="text-gray-900">{request.helperPhone}</p>
                        {request.helperAltPhone && <p className="text-gray-900 text-sm">Alt: {request.helperAltPhone}</p>}
                        {request.helperEmail && <p className="text-gray-900 text-sm">{request.helperEmail}</p>}
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <FileText className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Situation Description</p>
                        <p className="text-gray-900">{request.notes}</p>
                      </div>
                    </div>

                    {request.photoUrl && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-500 mb-2">Photo Evidence</p>
                        <img
                          src={request.photoUrl}
                          alt="Rescue situation"
                          className="max-h-64 rounded-lg border border-gray-200"
                        />
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    {request.status === 'pending' && (
                      <button
                        onClick={() => handleAcceptCase(request.id)}
                        className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-5 h-5" />
                        <span>Accept This Case</span>
                      </button>
                    )}

                    {request.status === 'assigned' && (
                      <button
                        onClick={() => handleUpdateStatus(request.id, 'on-the-way')}
                        className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <Navigation className="w-5 h-5" />
                        <span>Mark as On The Way</span>
                      </button>
                    )}

                    {request.status === 'on-the-way' && (
                      <button
                        onClick={() => handleUpdateStatus(request.id, 'reached')}
                        className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <MapPin className="w-5 h-5" />
                        <span>Mark as Reached Location</span>
                      </button>
                    )}

                    {request.status === 'reached' && (
                      <div className="space-y-3">
                        {selectedRequest === request.id && (
                          <div>
                            <label className="block text-gray-700 mb-2">
                              <span>Rescue Summary (Required)</span>
                            </label>
                            <textarea
                              value={rescuerNotes}
                              onChange={(e) => setRescuerNotes(e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              rows={3}
                              placeholder="Describe the rescue outcome, actions taken, condition of the person, etc."
                            />
                          </div>
                        )}
                        <button
                          onClick={() => {
                            if (selectedRequest === request.id) {
                              handleCompleteRescue(request.id);
                            } else {
                              setSelectedRequest(request.id);
                            }
                          }}
                          disabled={selectedRequest === request.id && !rescuerNotes}
                          className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                          <CheckCircle className="w-5 h-5" />
                          <span>Complete Rescue</span>
                        </button>
                      </div>
                    )}

                    <a
                      href={`tel:${request.helperPhone}`}
                      className="w-full bg-white text-blue-600 border-2 border-blue-600 py-3 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <Phone className="w-5 h-5" />
                      <span>Call Helper</span>
                    </a>
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