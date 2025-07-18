import React, { useState, useEffect, useCallback } from 'react';
import { Database, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/useAuth';

const DatabaseStatus: React.FC = () => {
  const [status, setStatus] = useState<{ connected: boolean; message: string; loading: boolean }>({
    connected: false,
    message: 'Checking connection...',
    loading: true
  });

  const { testDatabaseConnection } = useAuth();

  const checkConnection = useCallback(async () => {
    setStatus(prev => ({ ...prev, loading: true }));
    try {
      const result = await testDatabaseConnection();
      setStatus({
        connected: result.connected,
        message: result.message,
        loading: false
      });
    } catch {
      setStatus({
        connected: false,
        message: 'Failed to test connection',
        loading: false
      });
    }
  }, [testDatabaseConnection]);

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Database className="w-6 h-6 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Database Connection</h3>
            <p className="text-sm text-gray-600">
              {status.loading ? 'Testing connection...' : status.message}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {status.loading ? (
            <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
          ) : status.connected ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <XCircle className="w-5 h-5 text-red-500" />
          )}
          
          <button
            onClick={checkConnection}
            disabled={status.loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {status.loading ? 'Testing...' : 'Test Connection'}
          </button>
        </div>
      </div>

      {/* Connection Details */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Database Type:</span>
            <span className="ml-2 text-gray-900">SQLite</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Status:</span>
            <span className={`ml-2 font-medium ${status.connected ? 'text-green-600' : 'text-red-600'}`}>
              {status.connected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Features:</span>
            <span className="ml-2 text-gray-900">Authentication, User Management</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Admin Credentials:</span>
            <span className="ml-2 text-gray-900">admin@vovzone.com</span>
          </div>
        </div>
      </div>

      {/* Admin Login Instructions */}
      {status.connected && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Admin Login Instructions:</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <p><strong>Email:</strong> admin@vovzone.com</p>
            <p><strong>Password:</strong> vovzone2025</p>
            <p className="text-blue-600 mt-2">
              Use these credentials to access the admin dashboard and manage designer applications.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatabaseStatus;