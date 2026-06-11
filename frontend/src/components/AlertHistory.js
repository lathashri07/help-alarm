import React, { useState, useEffect } from 'react';
import { getAlerts } from '../services/api';

const AlertHistory = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAlerts();
    // Refresh alerts every 10 seconds
    const interval = setInterval(fetchAlerts, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const data = await getAlerts();
      setAlerts(data);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 border-l-4 border-orange-600">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <span className="text-3xl">📋</span>
        Alert History
      </h2>

      <div className="mb-6">
        <button
          onClick={fetchAlerts}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-all disabled:bg-gray-400"
        >
          {loading ? '⏳ Refreshing...' : '🔄 Refresh'}
        </button>
      </div>

      {alerts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            📭 No emergency alerts have been sent yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert, index) => (
            <div
              key={alert.id}
              className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-lg border-2 border-orange-300 hover:shadow-lg transition-all"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                <div>
                  <p className="text-sm text-gray-500 mb-2">Alert #{alerts.length - index}</p>
                  <p className="text-lg font-bold text-gray-800 mb-2">
                    🚨 {alert.message}
                  </p>
                  <p className="text-gray-700 mb-1">
                    <strong>📍 Location:</strong>
                  </p>
                  <p className="text-gray-600 text-sm mb-2">
                    Latitude: {alert.latitude?.toFixed(6) || 'N/A'}
                  </p>
                  <p className="text-gray-600 text-sm">
                    Longitude: {alert.longitude?.toFixed(6) || 'N/A'}
                  </p>
                </div>

                <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                  <p className="text-sm font-semibold text-gray-700 mb-2">⏰ Timestamp:</p>
                  <p className="text-gray-800 font-semibold">
                    {new Date(alert.timestamp).toLocaleString()}
                  </p>

                  {alert.latitude && alert.longitude && (
                    <a
                      href={`https://maps.google.com/?q=${alert.latitude},${alert.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-all"
                    >
                      📍 View on Map
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 p-4 bg-gray-100 rounded-lg border-l-4 border-gray-400">
        <p className="text-gray-700 text-sm">
          <strong>ℹ️ Info:</strong> This history shows all emergency alerts sent through the system.
          Each alert includes the user's location at the time of the alert and the timestamp.
        </p>
      </div>
    </div>
  );
};

export default AlertHistory;
