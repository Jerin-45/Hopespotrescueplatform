import { useState } from 'react';
import { ArrowLeft, MapPin, Phone, FileText, Clock, Shield, User, CheckCircle, AlertCircle } from 'lucide-react';
import { RescueRequest } from '../App';
import { DataManager } from './DataManager';
import { Header } from './Header';

interface AdminDashboardProps {
  onBack: () => void;
  requests: RescueRequest[];
  onUpdateStatus: (
    id: string,
    status: RescueRequest['status'],
    rescuerData?: { rescuerId: string; assignedRescuer: string; rescuerNotes?: string }
  ) => void;
  onClearData: () => void;
  onImportData: (data: RescueRequest[]) => void;
}

export function AdminDashboard({ onBack, requests, onUpdateStatus, onClearData, onImportData }: AdminDashboardProps) {
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [rescuerName, setRescuerName] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | RescueRequest['status']>('all');

  const handleAssignRescuer = (id: string) => {
    if (rescuerName.trim()) {
      onUpdateStatus(id, 'assigned', {
        rescuerId: Date.now().toString(),
        assignedRescuer: rescuerName,
      });
      setRescuerName('');
      setSelectedRequest(null);
    }
  };

  const handleCloseCase = (id: string) => {
    onUpdateStatus(id, 'completed');
  };

  const filteredRequests = filterStatus === 'all' 
    ? requests 
    : requests.filter(req => req.status === filterStatus);

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
    return date.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header variant="dark" />
      
      {/* Page Header */}
      <div className="bg-gray-900 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={onBack}
            className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8" />
            <h2 className="text-white">Admin Dashboard</h2>
          </div>
          <p className="text-gray-300">Manage and oversee all rescue operations</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-500 text-sm mb-1">Total Cases</p>
            <p className="text-gray-900">{requests.length}</p>
          </div>
          <div className="bg-yellow-50 p-6 rounded-lg shadow">
            <p className="text-yellow-700 text-sm mb-1">Pending</p>
            <p className="text-yellow-900">{requests.filter((r) => r.status === 'pending').length}</p>
          </div>
          <div className="bg-blue-50 p-6 rounded-lg shadow">
            <p className="text-blue-700 text-sm mb-1">Assigned</p>
            <p className="text-blue-900">{requests.filter((r) => r.status === 'assigned').length}</p>
          </div>
          <div className="bg-purple-50 p-6 rounded-lg shadow">
            <p className="text-purple-700 text-sm mb-1">In Progress</p>
            <p className="text-purple-900">
              {requests.filter((r) => r.status === 'on-the-way' || r.status === 'reached').length}
            </p>
          </div>
          <div className="bg-green-50 p-6 rounded-lg shadow">
            <p className="text-green-700 text-sm mb-1">Completed</p>
            <p className="text-green-900">{requests.filter((r) => r.status === 'completed').length}</p>
          </div>
        </div>

        {/* Data Management */}
        <DataManager 
          requests={requests}
          onClearData={onClearData}
          onImportData={onImportData}
        />

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterStatus === 'all'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Cases
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterStatus === 'pending'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilterStatus('assigned')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterStatus === 'assigned'
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              Assigned
            </button>
            <button
              onClick={() => setFilterStatus('on-the-way')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterStatus === 'on-the-way'
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
              }`}
            >
              On The Way
            </button>
            <button
              onClick={() => setFilterStatus('reached')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterStatus === 'reached'
                  ? 'bg-orange-600 text-white'
                  : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
              }`}
            >
              Reached
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterStatus === 'completed'
                  ? 'bg-green-600 text-white'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              Completed
            </button>
          </div>
        </div>

        {/* All Requests */}
        <div>
          <h2 className="mb-6 text-gray-900">
            {filterStatus === 'all' ? 'All Rescue Requests' : `${getStatusText(filterStatus as RescueRequest['status'])} Cases`}
          </h2>
          
          {filteredRequests.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <p className="text-gray-500">No cases match the selected filter</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredRequests.map((request) => (
                <div
                  key={request.id}
                  className={`bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow ${
                    request.status === 'pending' ? 'border-l-4 border-yellow-500' : ''
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-gray-900">Case #{request.id}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(request.status)}`}>
                          {getStatusText(request.status)}
                        </span>
                        {request.status === 'pending' && (
                          <AlertCircle className="w-5 h-5 text-yellow-600" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <Clock className="w-4 h-4" />
                        <span>{formatTime(request.timestamp)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-3">
                      <h4 className="text-gray-700">Helper Information</h4>
                      <div className="flex items-start gap-2">
                        <User className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Name</p>
                          <p className="text-gray-900">{request.helperName}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Phone className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Phone</p>
                          <p className="text-gray-900">{request.helperPhone}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-gray-700">Location & Details</h4>
                      <div className="flex items-start gap-2">
                        <MapPin className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Location</p>
                          <p className="text-gray-900">{request.location}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <FileText className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Situation</p>
                          <p className="text-gray-900">{request.notes}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {request.photoUrl && (
                    <div className="mb-6">
                      <p className="text-sm text-gray-500 mb-2">Photo Evidence</p>
                      <img
                        src={request.photoUrl}
                        alt="Rescue situation"
                        className="max-h-64 rounded-lg border border-gray-200"
                      />
                    </div>
                  )}

                  {request.assignedRescuer && (
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                      <p className="text-blue-900">
                        <strong>Assigned Rescuer:</strong> {request.assignedRescuer}
                      </p>
                    </div>
                  )}

                  {request.rescuerNotes && (
                    <div className="mb-6 p-4 bg-green-50 rounded-lg">
                      <p className="text-green-900 mb-1">
                        <strong>Rescue Summary:</strong>
                      </p>
                      <p className="text-green-800">{request.rescuerNotes}</p>
                    </div>
                  )}

                  {/* Admin Actions */}
                  <div className="space-y-3 border-t pt-4">
                    {request.status === 'pending' && (
                      <div>
                        {selectedRequest === request.id ? (
                          <div className="flex gap-3">
                            <input
                              type="text"
                              value={rescuerName}
                              onChange={(e) => setRescuerName(e.target.value)}
                              placeholder="Enter rescuer name"
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <button
                              onClick={() => handleAssignRescuer(request.id)}
                              disabled={!rescuerName.trim()}
                              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                              Assign
                            </button>
                            <button
                              onClick={() => {
                                setSelectedRequest(null);
                                setRescuerName('');
                              }}
                              className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setSelectedRequest(request.id)}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                          >
                            <User className="w-5 h-5" />
                            <span>Assign Rescuer</span>
                          </button>
                        )}
                      </div>
                    )}

                    {request.status === 'reached' && (
                      <button
                        onClick={() => handleCloseCase(request.id)}
                        className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-5 h-5" />
                        <span>Mark as Completed</span>
                      </button>
                    )}

                    {request.status === 'completed' && (
                      <div className="flex items-center justify-center gap-2 text-green-600 py-2">
                        <CheckCircle className="w-5 h-5" />
                        <span>Case Closed Successfully</span>
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