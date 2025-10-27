import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';

const DatabaseStatus: React.FC = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const connected = await apiService.isConnected();
        setIsConnected(connected);
      } catch (error) {
        console.error('API connection test failed:', error);
        setIsConnected(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkConnection();
  }, []);

  if (isLoading) {
    return (
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
          <span className="text-blue-800">Testing API connection...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 border rounded-lg ${
      isConnected 
        ? 'bg-green-50 border-green-200' 
        : 'bg-red-50 border-red-200'
    }`}>
      <div className="flex items-center">
        <div className={`w-3 h-3 rounded-full mr-2 ${
          isConnected ? 'bg-green-500' : 'bg-red-500'
        }`}></div>
        <span className={isConnected ? 'text-green-800' : 'text-red-800'}>
          {isConnected 
            ? 'API & MongoDB Connected Successfully' 
            : 'API Connection Failed'
          }
        </span>
      </div>
    </div>
  );
};

export default DatabaseStatus;
