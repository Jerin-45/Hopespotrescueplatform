import { useState, useMemo } from 'react';
import { ArrowLeft, Search, Download, Calendar, MapPin, User, Phone, FileText, Clock, Filter, TrendingUp, CheckCircle, AlertCircle, Users, Award } from 'lucide-react';
import { RescueRequest } from '../App';

interface ReportDashboardProps {
  onBack: () => void;
  requests: RescueRequest[];
}

type FilterStatus = 'all' | 'completed' | 'pending' | 'in-progress';
type ViewMode = 'cases' | 'rescuers';

export function ReportDashboard({ onBack, requests }: ReportDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedCase, setSelectedCase] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('cases');
  const [selectedRescuer, setSelectedRescuer] = useState<string | null>(null);

  // Filter and search logic
  const filteredRequests = useMemo(() => {
    let filtered = requests;

    // Filter by status
    if (filterStatus === 'completed') {
      filtered = filtered.filter(req => req.status === 'completed');
    } else if (filterStatus === 'pending') {
      filtered = filtered.filter(req => req.status === 'pending');
    } else if (filterStatus === 'in-progress') {
      filtered = filtered.filter(req => 
        req.status === 'assigned' || req.status === 'on-the-way' || req.status === 'reached'
      );
    }

    // Filter by date range
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      filtered = filtered.filter(req => new Date(req.timestamp) >= fromDate);
    }
    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999); // End of day
      filtered = filtered.filter(req => new Date(req.timestamp) <= toDate);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(req => 
        req.helperName.toLowerCase().includes(query) ||
        req.helperPhone.includes(query) ||
        req.location.toLowerCase().includes(query) ||
        req.notes.toLowerCase().includes(query) ||
        req.assignedRescuer?.toLowerCase().includes(query) ||
        req.id.includes(query)
      );
    }

    return filtered.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [requests, searchQuery, filterStatus, dateFrom, dateTo]);

  // Statistics
  const stats = useMemo(() => {
    const total = requests.length;
    const completed = requests.filter(r => r.status === 'completed').length;
    const pending = requests.filter(r => r.status === 'pending').length;
    const inProgress = requests.filter(r => 
      r.status === 'assigned' || r.status === 'on-the-way' || r.status === 'reached'
    ).length;
    const completionRate = total > 0 ? ((completed / total) * 100).toFixed(1) : '0';

    // Calculate average response time for completed cases
    const completedCases = requests.filter(r => r.status === 'completed');
    let avgResponseTime = 'N/A';
    if (completedCases.length > 0) {
      const totalTime = completedCases.reduce((acc, req) => {
        const start = new Date(req.timestamp).getTime();
        const end = new Date().getTime(); // In real app, we'd store completion time
        return acc + (end - start);
      }, 0);
      const avgMinutes = Math.floor(totalTime / completedCases.length / 60000);
      if (avgMinutes < 60) {
        avgResponseTime = `${avgMinutes}m`;
      } else {
        avgResponseTime = `${Math.floor(avgMinutes / 60)}h ${avgMinutes % 60}m`;
      }
    }

    return { total, completed, pending, inProgress, completionRate, avgResponseTime };
  }, [requests]);

  const getStatusColor = (status: RescueRequest['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'assigned':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'on-the-way':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'reached':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: RescueRequest['status']) => {
    if (status === 'completed') {
      return <CheckCircle className="w-4 h-4" />;
    }
    return <AlertCircle className="w-4 h-4" />;
  };

  const formatDateTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return `${diffDays}d ${diffHours % 24}h ago`;
    } else if (diffHours > 0) {
      return `${diffHours}h ${diffMins % 60}m ago`;
    } else {
      return `${diffMins}m ago`;
    }
  };

  const handleExportReport = () => {
    const reportData = filteredRequests.map(req => ({
      'Case ID': req.id,
      'Date & Time': formatDateTime(req.timestamp),
      'Helper Name': req.helperName,
      'Helper Phone': req.helperPhone,
      'Location': req.location,
      'Description': req.notes,
      'Status': req.status,
      'Assigned Rescuer': req.assignedRescuer || 'N/A',
      'Rescuer Notes': req.rescuerNotes || 'N/A',
    }));

    const csvContent = [
      Object.keys(reportData[0]).join(','),
      ...reportData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rescue-reports-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const selectedRequest = selectedCase ? requests.find(r => r.id === selectedCase) : null;

  // Rescuer statistics
  const rescuerStats = useMemo(() => {
    const rescuerMap = new Map<string, {
      name: string;
      totalCases: number;
      completed: number;
      inProgress: number;
      pending: number;
      completionRate: number;
      cases: RescueRequest[];
    }>();

    requests.forEach(req => {
      if (req.assignedRescuer) {
        const existing = rescuerMap.get(req.assignedRescuer);
        if (existing) {
          existing.totalCases++;
          if (req.status === 'completed') existing.completed++;
          else if (req.status === 'pending') existing.pending++;
          else existing.inProgress++;
          existing.cases.push(req);
        } else {
          rescuerMap.set(req.assignedRescuer, {
            name: req.assignedRescuer,
            totalCases: 1,
            completed: req.status === 'completed' ? 1 : 0,
            inProgress: (req.status === 'assigned' || req.status === 'on-the-way' || req.status === 'reached') ? 1 : 0,
            pending: req.status === 'pending' ? 1 : 0,
            completionRate: 0,
            cases: [req],
          });
        }
      }
    });

    // Calculate completion rates
    rescuerMap.forEach(rescuer => {
      rescuer.completionRate = rescuer.totalCases > 0 
        ? (rescuer.completed / rescuer.totalCases) * 100 
        : 0;
    });

    return Array.from(rescuerMap.values()).sort((a, b) => b.totalCases - a.totalCases);
  }, [requests]);

  const handleExportRescuerReport = () => {
    const reportData = rescuerStats.map(rescuer => ({
      'Rescuer Name': rescuer.name,
      'Total Cases': rescuer.totalCases,
      'Completed': rescuer.completed,
      'In Progress': rescuer.inProgress,
      'Pending': rescuer.pending,
      'Completion Rate': `${rescuer.completionRate.toFixed(1)}%`,
    }));

    const csvContent = [
      Object.keys(reportData[0]).join(','),
      ...reportData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rescuer-assignments-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={onBack}
            className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-white mb-2">Reports & Analytics</h1>
              <p className="text-blue-100">Comprehensive rescue case reports and statistics</p>
            </div>
            <button
              onClick={handleExportReport}
              className="flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <Download className="w-5 h-5" />
              <span>Export Report</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-500">
            <p className="text-gray-500 text-sm mb-1">Total Cases</p>
            <p className="text-blue-600">{stats.total}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-green-500">
            <p className="text-gray-500 text-sm mb-1">Completed</p>
            <p className="text-green-600">{stats.completed}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-yellow-500">
            <p className="text-gray-500 text-sm mb-1">Pending</p>
            <p className="text-yellow-600">{stats.pending}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-purple-500">
            <p className="text-gray-500 text-sm mb-1">In Progress</p>
            <p className="text-purple-600">{stats.inProgress}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-indigo-500">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-gray-500" />
              <p className="text-gray-500 text-sm">Success Rate</p>
            </div>
            <p className="text-indigo-600">{stats.completionRate}%</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-orange-500">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-gray-500" />
              <p className="text-gray-500 text-sm">Avg Time</p>
            </div>
            <p className="text-orange-600">{stats.avgResponseTime}</p>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h2 className="text-gray-900">Filters</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-gray-700 mb-2">
                <span>Search</span>
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by case ID, name, location..."
                  className="w-full pl-11 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-gray-700 mb-2">
                <span>Status</span>
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="in-progress">In Progress</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            {/* Date From */}
            <div>
              <label className="block text-gray-700 mb-2">
                <span>Date From</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full pl-11 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Date To */}
            <div>
              <label className="block text-gray-700 mb-2">
                <span>Date To</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full pl-11 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Clear Filters */}
          {(searchQuery || filterStatus !== 'all' || dateFrom || dateTo) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterStatus('all');
                setDateFrom('');
                setDateTo('');
              }}
              className="mt-4 text-blue-600 hover:text-blue-700 transition-colors"
            >
              Clear all filters
            </button>
          )}
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex bg-white rounded-lg shadow-lg p-1">
            <button
              onClick={() => setViewMode('cases')}
              className={`px-6 py-2 rounded-md transition-colors ${
                viewMode === 'cases'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>Case Reports</span>
              </div>
            </button>
            <button
              onClick={() => setViewMode('rescuers')}
              className={`px-6 py-2 rounded-md transition-colors ${
                viewMode === 'rescuers'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>Rescuer Assignments</span>
              </div>
            </button>
          </div>

          {viewMode === 'rescuers' && (
            <button
              onClick={handleExportRescuerReport}
              className="flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors shadow-lg border border-blue-200"
            >
              <Download className="w-5 h-5" />
              <span>Export Rescuer Report</span>
            </button>
          )}
        </div>

        {/* Rescuer Assignment Report View */}
        {viewMode === 'rescuers' && (
          <div>
            {rescuerStats.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-900 mb-2">No Rescuer Assignments</p>
                <p className="text-gray-500">No cases have been assigned to rescuers yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {rescuerStats.map((rescuer) => (
                  <div
                    key={rescuer.name}
                    className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden"
                  >
                    <div
                      className="p-6 cursor-pointer"
                      onClick={() => setSelectedRescuer(selectedRescuer === rescuer.name ? null : rescuer.name)}
                    >
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-gray-900 mb-1">{rescuer.name}</h3>
                            <p className="text-gray-500 text-sm">
                              {rescuer.totalCases} total {rescuer.totalCases === 1 ? 'case' : 'cases'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {rescuer.completionRate === 100 && (
                            <div className="flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full">
                              <Award className="w-4 h-4" />
                              <span className="text-sm">Top Performer</span>
                            </div>
                          )}
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Completion Rate</p>
                            <p className="text-green-600">{rescuer.completionRate.toFixed(1)}%</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-green-50 rounded-lg p-4">
                          <p className="text-sm text-gray-600 mb-1">Completed</p>
                          <p className="text-green-700">{rescuer.completed}</p>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-4">
                          <p className="text-sm text-gray-600 mb-1">In Progress</p>
                          <p className="text-purple-700">{rescuer.inProgress}</p>
                        </div>
                        <div className="bg-yellow-50 rounded-lg p-4">
                          <p className="text-sm text-gray-600 mb-1">Pending</p>
                          <p className="text-yellow-700">{rescuer.pending}</p>
                        </div>
                      </div>

                      {selectedRescuer === rescuer.name && (
                        <div className="mt-6 pt-6 border-t border-gray-200">
                          <h4 className="text-gray-900 mb-4">Assigned Cases</h4>
                          <div className="space-y-3">
                            {rescuer.cases.map((caseItem) => (
                              <div
                                key={caseItem.id}
                                className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-gray-900">Case #{caseItem.id}</span>
                                  <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(caseItem.status)}`}>
                                    {caseItem.status.replace('-', ' ').toUpperCase()}
                                  </span>
                                </div>
                                <div className="text-sm text-gray-600 space-y-1">
                                  <div className="flex items-center gap-2">
                                    <MapPin className="w-3 h-3" />
                                    <span>{caseItem.location}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-3 h-3" />
                                    <span>{formatDateTime(caseItem.timestamp)}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Case Reports View */}
        {viewMode === 'cases' && (
          <>
            {/* Results Count */}
            <div className="mb-4">
              <p className="text-gray-600">
                Showing {filteredRequests.length} of {requests.length} cases
              </p>
            </div>

            {/* Cases List */}
            <div className="space-y-4">
              {filteredRequests.length === 0 ? (
                <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                  <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-900 mb-2">No cases found</p>
                  <p className="text-gray-500">Try adjusting your filters</p>
                </div>
              ) : (
                filteredRequests.map((request) => (
                  <div
                    key={request.id}
                    className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden"
                  >
                    <div
                      className="p-6 cursor-pointer"
                      onClick={() => setSelectedCase(selectedCase === request.id ? null : request.id)}
                    >
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h3 className="text-gray-900">Case #{request.id}</h3>
                            <span className={`px-3 py-1 rounded-full text-sm border flex items-center gap-1 ${getStatusColor(request.status)}`}>
                              {getStatusIcon(request.status)}
                              {request.status.replace('-', ' ').toUpperCase()}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{formatDateTime(request.timestamp)}</span>
                            </div>
                            <span>•</span>
                            <span>{formatDuration(request.timestamp)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-start gap-2">
                          <User className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-500">Helper</p>
                            <p className="text-gray-900">{request.helperName}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <Phone className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-500">Contact</p>
                            <p className="text-gray-900">{request.helperPhone}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2 md:col-span-2">
                          <MapPin className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-500">Location</p>
                            <p className="text-gray-900">{request.location}</p>
                          </div>
                        </div>
                      </div>

                      {selectedCase === request.id && (
                        <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
                          <div className="flex items-start gap-2">
                            <FileText className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm text-gray-500 mb-1">Situation Description</p>
                              <p className="text-gray-900">{request.notes}</p>
                            </div>
                          </div>

                          {request.assignedRescuer && (
                            <div className="flex items-start gap-2">
                              <User className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                              <div className="flex-1">
                                <p className="text-sm text-gray-500 mb-1">Assigned Rescuer</p>
                                <p className="text-gray-900">{request.assignedRescuer}</p>
                              </div>
                            </div>
                          )}

                          {request.rescuerNotes && (
                            <div className="flex items-start gap-2">
                              <FileText className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                              <div className="flex-1">
                                <p className="text-sm text-gray-500 mb-1">Rescue Summary</p>
                                <p className="text-gray-900">{request.rescuerNotes}</p>
                              </div>
                            </div>
                          )}

                          {request.photoUrl && (
                            <div>
                              <p className="text-sm text-gray-500 mb-2">Photo Evidence</p>
                              <img
                                src={request.photoUrl}
                                alt="Rescue situation"
                                className="max-h-96 rounded-lg border border-gray-200"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}