import React, { useState, useEffect } from 'react';
import { getAlerts, clearAlertHistory } from '../services/api';

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

  const handleClearHistory = async () => {
    if (window.confirm('Are you sure you want to permanently clear the alert history?')) {
      setLoading(true);
      try {
        await clearAlertHistory();
        setAlerts([]);
      } catch (error) {
        console.error('Failed to clear alert history:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl p-8 hover:border-cyan-500/20 transition-all duration-300">
      <h2 className="text-2xl md:text-3xl font-extrabold text-slate-100 mb-6 flex items-center gap-2">
        <span className="text-2xl md:text-3xl">📋</span>
        Alert History
      </h2>

      <div className="mb-6 flex flex-wrap gap-4">
        <button
          onClick={fetchAlerts}
          disabled={loading}
          className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-white font-bold py-2.5 px-6 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-sm md:text-base shadow-md shadow-cyan-500/10"
        >
          {loading ? '⏳ Refreshing...' : '🔄 Refresh'}
        </button>
        <button
          onClick={handleClearHistory}
          disabled={loading || alerts.length === 0}
          className="bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold py-2.5 px-6 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-600 text-sm md:text-base shadow-md shadow-rose-600/10"
        >
          🗑️ Clear History
        </button>
      </div>

      {alerts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-400 text-base md:text-lg font-medium">
            📭 No emergency alerts have been sent yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert, index) => (
            <div
              key={alert.id}
              className="bg-slate-950/40 p-6 rounded-xl border border-white/5 hover:border-rose-500/25 transition-all duration-300 hover:shadow-lg hover:shadow-rose-950/10"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <div>
                  <p className="text-xs md:text-sm text-slate-500 font-semibold mb-1">Alert #{alerts.length - index}</p>
                  <p className="text-base md:text-lg font-bold text-rose-400 mb-3 leading-snug">
                    🚨 {alert.message}
                  </p>
                  <p className="text-slate-300 font-semibold text-sm md:text-base mb-1.5 flex items-center gap-1">
                    <span>📍</span> Location:
                  </p>
                  <p className="text-slate-400 text-xs md:text-sm font-medium mb-1 font-mono">
                    Latitude: {alert.latitude?.toFixed(6) || 'N/A'}
                  </p>
                  <p className="text-slate-400 text-xs md:text-sm font-medium font-mono">
                    Longitude: {alert.longitude?.toFixed(6) || 'N/A'}
                  </p>
                </div>

                <div className="bg-slate-900/80 p-5 rounded-xl border border-white/5">
                  <p className="text-xs md:text-sm font-semibold text-slate-400 mb-1">⏰ Timestamp:</p>
                  <p className="text-slate-200 font-bold text-sm md:text-base">
                    {new Date(alert.timestamp).toLocaleString()}
                  </p>

                  {alert.latitude && alert.longitude && (
                    <a
                      href={`https://maps.google.com/?q=${alert.latitude},${alert.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-4 w-full text-center bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-2.5 px-4 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-md shadow-cyan-900/20 text-xs md:text-sm"
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

      <div className="mt-8 p-5 bg-slate-950/40 rounded-xl border border-white/5">
        <p className="text-slate-400 text-xs md:text-sm font-medium leading-relaxed">
          <strong className="text-slate-300">ℹ️ Info:</strong> This history shows all emergency alerts sent through the system.
          Each alert includes the user's location at the time of the alert and the timestamp.
        </p>
      </div>
    </div>
  );
};

export default AlertHistory;
