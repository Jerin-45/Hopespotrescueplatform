import { useState } from 'react';
import { ArrowLeft, MapPin, Phone, FileText, Clock, Shield, User, CheckCircle, AlertCircle, BarChart3, Users, Mail, MapPinned, XCircle, Award, TrendingUp } from 'lucide-react';
import { RescueRequest, RescuerAccount } from '../App';
import { Header } from './Header';
import { ReportDashboard } from './ReportDashboard';

interface AdminDashboardProps {
  onBack: () => void;
  requests: RescueRequest[];
  onUpdateStatus: (
    id: string,
    status: RescueRequest['status'],
    rescuerData?: { rescuerId: string; assignedRescuer: string; rescuerNotes?: string }
  ) => void;
  rescuers: RescuerAccount[];
}

export function AdminDashboard({ onBack, requests, onUpdateStatus, rescuers }: AdminDashboardProps) {
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [selectedRescuerId, setSelectedRescuerId] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | RescueRequest['status']>('all');
  const [showReports, setShowReports] = useState(false);
  const [showRescuerDirectory, setShowRescuerDirectory] = useState(false);
  const [viewMode, setViewMode] = useState<'cases' | 'assignments'>('cases');

  // Show reports view if requested
  if (showReports) {
    return <ReportDashboard onBack={() => setShowReports(false)} requests={requests} />;
  }

  // Show rescuer directory if requested
  if (showRescuerDirectory) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header variant="dark" />
        
        {/* Page Header */}
        <div className="bg-gray-900 text-white p-6 shadow-lg">
          <div className="max-w-7xl mx-auto">
            <button
              onClick={() => setShowRescuerDirectory(false)}
              className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </button>
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-8 h-8" />
              <h2 className="text-white">Rescuer Directory</h2>
            </div>
            <p className="text-gray-300">View all registered rescuers and their information</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-6">
          <div className="mb-6 bg-white rounded-lg shadow p-4">
            <p className="text-gray-700">
              <strong>Total Rescuers:</strong> {rescuers.length}
            </p>
          </div>

          <div className="grid gap-6">
            {rescuers.map((rescuer) => (
              <div
                key={rescuer.id}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-red-100 p-3 rounded-full">
                      <User className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-gray-900">{rescuer.name}</h3>
                      <span className="inline-block mt-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                        {rescuer.displayId || rescuer.id.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Registered</p>
                    <p className="text-gray-900 text-sm">
                      {new Date(rescuer.registeredAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <Phone className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Phone Number</p>
                        <p className="text-gray-900">{rescuer.phone}</p>
                        {rescuer.altPhone && (
                          <p className="text-gray-600 text-sm mt-1">Alt: {rescuer.altPhone}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Mail className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Email Address</p>
                        <p className="text-gray-900">{rescuer.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <MapPinned className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Address</p>
                        <p className="text-gray-900">{rescuer.address}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex gap-2">
                    <a
                      href={`tel:${rescuer.phone}`}
                      className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Phone className="w-4 h-4" />
                      <span>Call</span>
                    </a>
                    <a
                      href={`mailto:${rescuer.email}`}
                      className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Mail className="w-4 h-4" />
                      <span>Email</span>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const handleAssignRescuer = (id: string) => {
    if (selectedRescuerId) {
      const rescuer = rescuers.find(r => r.id === selectedRescuerId);
      if (rescuer) {
        onUpdateStatus(id, 'assigned', {
          rescuerId: rescuer.id,
          assignedRescuer: rescuer.displayId || rescuer.name || rescuer.id.toUpperCase(),
        });
        setSelectedRescuerId('');
        setSelectedRequest(null);
      }
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
      case 'accepted':
        return 'bg-indigo-100 text-indigo-800';
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
      case 'accepted':
        return 'Rescuer Accepted';
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

  // Calculate rescuer statistics
  const rescuerStats = (() => {
    const statsMap = new Map<string, {
      id: string;
      name: string;
      totalCases: number;
      assigned: number;
      accepted: number;
      inProgress: number;
      completed: number;
      completionRate: number;
      phone: string;
      email: string;
    }>();

    // Initialize all rescuers with zero stats
    rescuers.forEach(rescuer => {
      statsMap.set(rescuer.id, {
        id: rescuer.id,
        name: rescuer.name,
        totalCases: 0,
        assigned: 0,
        accepted: 0,
        inProgress: 0,
        completed: 0,
        completionRate: 0,
        phone: rescuer.phone,
        email: rescuer.email,
      });
    });

    // Count cases for each rescuer
    requests.forEach(req => {
      if (req.rescuerId && req.assignedRescuer) {
        const stats = statsMap.get(req.rescuerId);
        if (stats) {
          stats.totalCases++;
          if (req.status === 'assigned') stats.assigned++;
          else if (req.status === 'accepted') stats.accepted++;
          else if (req.status === 'on-the-way' || req.status === 'reached') stats.inProgress++;
          else if (req.status === 'completed') stats.completed++;
        }
      }
    });

    // Calculate completion rates
    statsMap.forEach(stats => {
      stats.completionRate = stats.totalCases > 0 
        ? (stats.completed / stats.totalCases) * 100 
        : 0;
    });

    return Array.from(statsMap.values()).sort((a, b) => b.totalCases - a.totalCases);
  })();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header variant="dark" />
      
      {/* Page Header */}
      <div className="bg-gray-900 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => setShowRescuerDirectory(true)}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Users className="w-5 h-5" />
                <span>Rescuer Directory</span>
              </button>
              <button
                onClick={() => setShowReports(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <BarChart3 className="w-5 h-5" />
                <span>View Reports</span>
              </button>
            </div>
          </div>
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
          <div className="bg-indigo-50 p-6 rounded-lg shadow">
            <p className="text-indigo-700 text-sm mb-1">Accepted</p>
            <p className="text-indigo-900">{requests.filter((r) => r.status === 'accepted').length}</p>
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

        {/* View Mode Toggle */}
        <div className="flex bg-white rounded-lg shadow-lg p-1 mb-6">
          <button
            onClick={() => setViewMode('cases')}
            className={`flex-1 px-6 py-3 rounded-md transition-colors ${
              viewMode === 'cases'
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <FileText className="w-4 h-4" />
              <span>Case Reports</span>
            </div>
          </button>
          <button
            onClick={() => setViewMode('assignments')}
            className={`flex-1 px-6 py-3 rounded-md transition-colors ${
              viewMode === 'assignments'
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Users className="w-4 h-4" />
              <span>Rescuer Assignments</span>
            </div>
          </button>
        </div>

        {/* Rescuer Assignments View */}
        {viewMode === 'assignments' && (
          <div>
            <h2 className="mb-6 text-gray-900">Rescuer Assignment Overview</h2>
            
            {rescuerStats.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-900 mb-2">No Rescuers Found</p>
                <p className="text-gray-500">No rescuers have been registered yet</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left px-6 py-4 text-gray-700">Rescuer</th>
                        <th className="text-center px-6 py-4 text-gray-700">Total Cases</th>
                        <th className="text-center px-6 py-4 text-gray-700">Accepted</th>
                        <th className="text-center px-6 py-4 text-gray-700">Completed</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {rescuerStats.map((stats) => (
                        <tr key={stats.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                                <User className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <p className="text-gray-900">{stats.name}</p>
                                <p className="text-sm text-gray-500">{stats.id.toUpperCase()}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center justify-center w-10 h-10 bg-gray-100 text-gray-900 rounded-full">
                              {stats.totalCases}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center justify-center w-10 h-10 bg-indigo-100 text-indigo-900 rounded-full">
                              {stats.accepted}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center justify-center w-10 h-10 bg-green-100 text-green-900 rounded-full">
                              {stats.completed}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Case Reports View */}
        {viewMode === 'cases' && (
          <>
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
              onClick={() => setFilterStatus('accepted')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterStatus === 'accepted'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
              }`}
            >
              Accepted
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
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-gray-900">Case #{request.id}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(request.status)}`}>
                          {getStatusText(request.status)}
                        </span>
                        {request.status === 'pending' && (
                          <AlertCircle className="w-5 h-5 text-yellow-600" />
                        )}
                      </div>
                      {request.trackingId && (
                        <div className="mb-2">
                          <span className="inline-block bg-purple-100 text-purple-900 px-3 py-1 rounded-md text-sm font-mono">
                            {request.trackingId}
                          </span>
                        </div>
                      )}
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
                          {request.helperAltPhone && <p className="text-gray-900 text-sm mt-1">Alt: {request.helperAltPhone}</p>}
                          {request.helperEmail && <p className="text-gray-900 text-sm">{request.helperEmail}</p>}
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

                  {(request.assignedRescuer || request.trackingId) && (
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg space-y-2">
                      {request.assignedRescuer && (
                        <p className="text-blue-900">
                          <strong>Assigned Rescuer:</strong> {request.assignedRescuer}
                        </p>
                      )}
                      {request.trackingId && (
                        <p className="text-blue-900">
                          <strong>Tracking ID:</strong> <span className="font-mono">{request.trackingId}</span>
                        </p>
                      )}
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

                  {/* Show rejection history if any rescuers have rejected */}
                  {request.rejectedBy && request.rejectedBy.length > 0 && (
                    <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-start gap-2">
                        <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-red-900 mb-2">
                            <strong>Rejection History:</strong>
                          </p>
                          {request.rejectionReasons && request.rejectionReasons.length > 0 ? (
                            <div className="space-y-3">
                              {request.rejectionReasons.map((rejection, index) => (
                                <div key={index} className="bg-white p-3 rounded border border-red-200">
                                  <p className="text-red-900 mb-1">
                                    <strong>{rejection.rescuerName}</strong> ({rejection.rescuerId.toUpperCase()})
                                  </p>
                                  <p className="text-red-800 text-sm mb-1">
                                    <strong>Reason:</strong> {rejection.reason}
                                  </p>
                                  <p className="text-red-700 text-xs">
                                    {new Date(rejection.timestamp).toLocaleString()}
                                  </p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-red-800 text-sm">
                              This case was rejected by: {request.rejectedBy.map(id => {
                                const rescuer = rescuers.find(r => r.id === id);
                                return rescuer ? `${rescuer.id.toUpperCase()} (${rescuer.name})` : id.toUpperCase();
                              }).join(', ')}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Admin Actions */}
                  <div className="space-y-3 border-t pt-4">
                    {request.status === 'pending' && (
                      <div>
                        {selectedRequest === request.id ? (
                          <div className="space-y-3">
                            <div className="flex gap-3">
                              <select
                                value={selectedRescuerId}
                                onChange={(e) => setSelectedRescuerId(e.target.value)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              >
                                <option value="">Select a rescuer</option>
                                {rescuers
                                  .filter(r => r.id && !(request.rejectedBy && request.rejectedBy.includes(r.id)))
                                  .map(rescuer => (
                                    <option key={rescuer.id} value={rescuer.id}>
                                      {rescuer.id.toUpperCase()} - {rescuer.name}
                                    </option>
                                  ))}
                              </select>
                              <button
                                onClick={() => handleAssignRescuer(request.id)}
                                disabled={!selectedRescuerId}
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                              >
                                Dispatch Rescuer
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedRequest(null);
                                  setSelectedRescuerId('');
                                }}
                                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                            {selectedRescuerId && (
                              <div className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-blue-900">
                                  {rescuers.find(r => r.id === selectedRescuerId)?.id.toUpperCase()} - {rescuers.find(r => r.id === selectedRescuerId)?.name}
                                </p>
                              </div>
                            )}
                            {request.rejectedBy && request.rejectedBy.length > 0 && (
                              <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                                <p className="text-gray-700 text-sm">
                                  <strong>Note:</strong> Rescuers who rejected this case are excluded from the list
                                </p>
                              </div>
                            )}
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
          </>
        )}
      </div>
    </div>
  );
}