import React, { useState, useEffect } from 'react';
import { Users, CheckCircle, XCircle, Clock, Eye, Mail, Phone, Building, Calendar } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { User } from '../types';
import { apiService } from '../services/api';
import DatabaseStatus from './DatabaseStatus';

const AdminDashboard: React.FC = () => {
  const { user, approveDesigner, rejectDesigner } = useAuth();
  const [pendingApplications, setPendingApplications] = useState<User[]>([]);
  const [approvedDesigners, setApprovedDesigners] = useState<User[]>([]);
  const [rejectedApplications, setRejectedApplications] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedApplication, setSelectedApplication] = useState<User | null>(null);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const pending = await apiService.getPendingApplications();
      setPendingApplications(pending);
      
      // For now, we'll keep approved/rejected as empty arrays since the API focuses on pending
      // In a full implementation, you'd have separate endpoints for these
      setApprovedDesigners([]);
      setRejectedApplications([]);
    } catch (error) {
      console.error('Failed to load applications:', error);
      // Fallback to localStorage if API fails
      const pending = JSON.parse(localStorage.getItem('pendingApplications') || '[]');
      const approved = JSON.parse(localStorage.getItem('approvedDesigners') || '[]');
      const rejected = JSON.parse(localStorage.getItem('rejectedApplications') || '[]');
      
      setPendingApplications(pending);
      setApprovedDesigners(approved);
      setRejectedApplications(rejected);
    }
  };

  const handleApprove = async (designerId: string) => {
    const success = await approveDesigner(designerId);
    if (success) {
      loadApplications();
      setSelectedApplication(null);
      alert('Designer approved successfully!');
    }
  };

  const handleReject = async (designerId: string) => {
    const success = await rejectDesigner(designerId);
    if (success) {
      loadApplications();
      setSelectedApplication(null);
      alert('Application rejected.');
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const ApplicationCard: React.FC<{ application: User; showActions?: boolean }> = ({ 
    application, 
    showActions = false 
  }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start space-x-4">
        <img
          src={application.designer?.avatar || 'https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg?auto=compress&cs=tinysrgb&w=100'}
          alt={application.name}
          className="w-16 h-16 rounded-full object-cover"
        />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{application.name}</h3>
            <span className={`px-3 py-1 text-xs rounded-full font-medium ${
              application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              application.status === 'approved' ? 'bg-green-100 text-green-800' :
              'bg-red-100 text-red-800'
            }`}>
              {application.status?.charAt(0).toUpperCase() + application.status?.slice(1)}
            </span>
          </div>
          
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <Building className="w-4 h-4" />
              <span>{application.designer?.company}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4" />
              <span>{application.email}</span>
            </div>
            {application.designer?.phone && (
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>{application.designer.phone}</span>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Applied: {application.appliedAt ? formatDate(application.appliedAt) : 'N/A'}</span>
            </div>
            {application.designer?.specialties && application.designer.specialties.length > 0 && (
              <div className="flex items-center space-x-2">
                <Award className="w-4 h-4" />
                <span>{application.designer.experience ?? 0} years experience</span>
              </div>
            )}
          </div>

          <div className="mt-3">
            <p className="text-sm text-gray-700 line-clamp-2">{application.designer?.bio}</p>
          </div>

          <div className="mt-3 flex flex-wrap gap-1">
            {application.designer?.specialties.slice(0, 3).map((specialty) => (
              <span
                key={specialty}
                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
              >
                {specialty}
              </span>
            ))}
            {application.designer?.specialties && application.designer.specialties.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{application.designer.specialties.length - 3} more
              </span>
            )}
          </div>

          {showActions && (
            <div className="mt-4 flex space-x-3">
              <button
                onClick={() => setSelectedApplication(application)}
                className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-1"
              >
                <Eye className="w-4 h-4" />
                <span>View Details</span>
              </button>
              <button
                onClick={() => handleApprove(application.id)}
                className="px-4 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-1"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Approve</span>
              </button>
              <button
                onClick={() => handleReject(application.id)}
                className="px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-1"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">VovZone Admin Dashboard</h1>
          <p className="text-gray-600">Manage designer applications and platform users</p>
        </div>

        {/* Database Status */}
        <DatabaseStatus />

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-semibold text-gray-900">{pendingApplications.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-semibold text-gray-900">{approvedDesigners.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="bg-red-100 p-3 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-semibold text-gray-900">{rejectedApplications.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {pendingApplications.length + approvedDesigners.length + rejectedApplications.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {[
                { id: 'pending', label: 'Pending Applications', count: pendingApplications.length },
                { id: 'approved', label: 'Approved Designers', count: approvedDesigners.length },
                { id: 'rejected', label: 'Rejected Applications', count: rejectedApplications.length },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-amber-500 text-amber-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                >
                  <span>{tab.label}</span>
                  <span className="bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'pending' && (
              <div className="space-y-4">
                {pendingApplications.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No pending applications</h3>
                    <p className="text-gray-600">All applications have been reviewed.</p>
                  </div>
                ) : (
                  pendingApplications.map((application) => (
                    <ApplicationCard
                      key={application.id}
                      application={application}
                      showActions={true}
                    />
                  ))
                )}
              </div>
            )}

            {activeTab === 'approved' && (
              <div className="space-y-4">
                {approvedDesigners.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No approved designers</h3>
                    <p className="text-gray-600">No designers have been approved yet.</p>
                  </div>
                ) : (
                  approvedDesigners.map((designer) => (
                    <ApplicationCard
                      key={designer.id}
                      application={designer}
                    />
                  ))
                )}
              </div>
            )}

            {activeTab === 'rejected' && (
              <div className="space-y-4">
                {rejectedApplications.length === 0 ? (
                  <div className="text-center py-12">
                    <XCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No rejected applications</h3>
                    <p className="text-gray-600">No applications have been rejected.</p>
                  </div>
                ) : (
                  rejectedApplications.map((application) => (
                    <ApplicationCard
                      key={application.id}
                      application={application}
                    />
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Application Detail Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSelectedApplication(null)} />
          
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Designer Application</h2>
                <button
                  onClick={() => setSelectedApplication(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="text-center">
                <img
                  src={selectedApplication.designer?.avatar}
                  alt={selectedApplication.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="text-xl font-semibold text-gray-900">{selectedApplication.name}</h3>
                <p className="text-gray-600">{selectedApplication.designer?.company}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <p className="text-gray-900">{selectedApplication.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <p className="text-gray-900">{selectedApplication.designer?.phone || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                  <p className="text-gray-900">{selectedApplication.designer?.website || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                  <p className="text-gray-900">{selectedApplication.designer?.experience} years</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                <p className="text-gray-900">{selectedApplication.designer?.bio}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Specialties</label>
                <div className="flex flex-wrap gap-2">
                  {selectedApplication.designer?.specialties.map((specialty) => (
                    <span
                      key={specialty}
                      className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex space-x-4 pt-6 border-t border-gray-200">
                <button
                  onClick={() => handleApprove(selectedApplication.id)}
                  className="flex-1 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Approve Designer</span>
                </button>
                <button
                  onClick={() => handleReject(selectedApplication.id)}
                  className="flex-1 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors flex items-center justify-center space-x-2"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject Application</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;