import React, { useState, useEffect } from 'react';
import { sendEmergencyAlert } from '../services/api';

const EmergencyAlert = ({ contacts }) => {
  const [location, setLocation] = useState(null);
  const [alertSending, setAlertSending] = useState(false);
  const [message, setMessage] = useState('');
  const [locationMessage, setLocationMessage] = useState('');
  const [lastAlert, setLastAlert] = useState(null);
  const [autoTriggered, setAutoTriggered] = useState(false);

  // Auto-get location on component mount
  useEffect(() => {
    getLocationAuto();
  }, []);

  useEffect(() => {
    // Listen for emergency alert trigger from voice recognition
    const handleTriggerAlert = async () => {
      await sendAlertAuto();
    };

    window.addEventListener('triggerEmergencyAlert', handleTriggerAlert);

    return () => {
      window.removeEventListener('triggerEmergencyAlert', handleTriggerAlert);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, contacts]);

  // Auto-get location (called on mount)
  const getLocationAuto = () => {
    if (!navigator.geolocation) {
      setLocationMessage('❌ Geolocation not supported by your browser');
      return;
    }

    setLocationMessage('📍 Detecting your location automatically...');
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
        setLocationMessage(
          `✅ Location detected! Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`
        );
      },
      (error) => {
        setLocationMessage(`⚠️ Location detection: ${error.message}`);
        console.error('Geolocation error:', error);
      }
    );
  };

  // Auto-send emergency alert (called when "HELP" is detected)
  const sendAlertAuto = async () => {
    // Update location first
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.log('Geolocation not available');
        resolve();
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });

          if (contacts.length === 0) {
            console.log('No emergency contacts to notify');
            resolve();
            return;
          }

          setAlertSending(true);
          setAutoTriggered(true);
          setMessage('🚨 AUTO-TRIGGERED! Location captured & alert sending...');

          try {
            const response = await sendEmergencyAlert(
              latitude,
              longitude,
              `🆘 EMERGENCY DETECTED! Your loved one is in DANGER! Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
            );

            setLastAlert({
              location: { latitude, longitude },
              contacts: response.contactsNotified,
              timestamp: new Date(),
              pushResults: response.pushResults
            });

            setMessage(
              `✅ EMERGENCY ALERT SENT!\n` +
              `📞 Notified: ${response.contactsNotified} contact(s)\n` +
              `📍 Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}\n` +
              `🗺️ Maps: ${response.mapsLink}`
            );

            console.log('Emergency alert response:', response);

            setTimeout(() => {
              setMessage('');
              setAutoTriggered(false);
            }, 8000);
          } catch (error) {
            setMessage('❌ Failed to send emergency alert');
            console.error('Error sending alert:', error);
            setAutoTriggered(false);
          } finally {
            setAlertSending(false);
            resolve();
          }
        },
        (error) => {
          console.error('Failed to get location for alert:', error);
          resolve();
        }
      );
    });
  };

  return (
    <div className="space-y-6">
      {/* Auto-triggered Status */}
      {autoTriggered && (
        <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-lg shadow-xl p-8 border-4 border-red-700 animate-pulse">
          <div className="text-center text-white">
            <p className="text-4xl font-black mb-2">🚨 EMERGENCY PROTOCOL ACTIVATED!</p>
            <p className="text-xl font-bold animate-bounce">Sending alert to all contacts...</p>
          </div>
        </div>
      )}

      {/* Location Status */}
      <div className="bg-white rounded-lg shadow-lg p-8 border-l-4 border-purple-600">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span className="text-3xl">📍</span>
          Location Tracking (Auto)
        </h2>

        <div className="mb-6">
          <button
            id="test-trigger"
            disabled={alertSending}
            onClick={() => window.dispatchEvent(new Event('triggerEmergencyAlert'))}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg shadow transition-all transform hover:scale-102 active:scale-98 text-md flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {alertSending ? '🚨 Sending Emergency Alert...' : '🚨 Trigger Emergency Alert (Test Hook)'}
          </button>
        </div>

        {locationMessage && (
          <div className={`mb-6 p-4 rounded-lg font-semibold text-lg ${
            locationMessage.includes('✅')
              ? 'bg-green-100 text-green-800 border-2 border-green-500'
              : locationMessage.includes('⚠️')
              ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-500'
              : 'bg-blue-100 text-blue-800 border-2 border-blue-300'
          }`}>
            {locationMessage}
          </div>
        )}

        {location && (
          <div className="mb-6 p-4 bg-green-50 border-2 border-green-300 rounded-lg">
            <p className="text-green-800 font-semibold text-lg mb-2">📌 Current Location (Real-time):</p>
            <p className="text-green-700 text-lg">
              <strong>Latitude:</strong> {location.latitude.toFixed(6)}
            </p>
            <p className="text-green-700 text-lg">
              <strong>Longitude:</strong> {location.longitude.toFixed(6)}
            </p>
            <p className="text-sm text-green-600 mt-3">
              <a
                href={`https://maps.google.com/?q=${location.latitude},${location.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-green-800 font-bold"
              >
                🗺️ View on Google Maps →
              </a>
            </p>
          </div>
        )}

        <p className="text-center text-gray-600 font-semibold text-sm p-3 bg-blue-50 rounded-lg border border-blue-300">
          ✨ Location is automatically detected when app loads and updated when emergency is triggered
        </p>
      </div>

      {/* Alert Message Display */}
      {message && (
        <div className={`rounded-lg shadow-lg p-8 border-4 font-semibold text-lg whitespace-pre-line ${
          message.includes('✅')
            ? 'bg-green-100 text-green-800 border-green-500 animate-pulse'
            : message.includes('🚨')
            ? 'bg-red-100 text-red-800 border-red-500 animate-pulse'
            : 'bg-yellow-100 text-yellow-800 border-yellow-500'
        }`}>
          {message}
        </div>
      )}

      {/* Emergency Alert Info */}
      <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg shadow-lg p-8 border-4 border-red-600">
        <h2 className="text-3xl font-bold text-red-700 mb-6 flex items-center gap-2">
          <span className="text-4xl">🆘</span>
          Emergency Alert Status (Auto)
        </h2>

        <div className="mb-6 p-6 bg-white rounded-lg border-2 border-red-300">
          <p className="text-gray-800 mb-3">
            <span className="font-bold text-lg">📞 Emergency Contacts:</span>
          </p>
          {contacts.length > 0 ? (
            <div className="space-y-2">
              {contacts.map((contact, index) => (
                <p key={contact.id} className="text-gray-700 flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>{index + 1}. {contact.contact_name} - {contact.phone_number}</span>
                </p>
              ))}
            </div>
          ) : (
            <p className="text-red-600 font-semibold">
              ⚠️ No emergency contacts added. Please add contacts first!
            </p>
          )}
        </div>

        {/* Alert Details if sent */}
        {lastAlert && (
          <div className="mb-6 p-6 bg-green-50 border-2 border-green-500 rounded-lg">
            <p className="font-bold text-green-800 text-lg mb-2">✅ Last Emergency Alert Sent:</p>
            <p className="text-green-700">📞 Contacts Notified: {lastAlert.contacts}</p>
            <p className="text-green-700">⏰ Time: {lastAlert.timestamp.toLocaleTimeString()}</p>
            <p className="text-green-700">📍 Location: {lastAlert.location.latitude.toFixed(4)}, {lastAlert.location.longitude.toFixed(4)}</p>
            
            {lastAlert.pushResults && lastAlert.pushResults.length > 0 && (
              <div className="mt-4 p-3 bg-white rounded border border-purple-300">
                <p className="font-bold text-purple-800 mb-2">🔔 Push Notification Status:</p>
                {lastAlert.pushResults.map((result, idx) => (
                  <p key={idx} className={`text-sm ${result.status === 'delivered' ? 'text-purple-700' : 'text-red-700'}`}>
                    {result.status === 'delivered' ? '✅' : '❌'} {result.contact} ({result.phone}): {result.status}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="p-4 bg-yellow-100 border-2 border-yellow-500 rounded-lg">
          <p className="text-yellow-800 font-bold text-lg mb-2">✨ How Auto-Alert Works:</p>
          <ul className="text-yellow-800 space-y-1 font-semibold">
            <li>✓ 🎤 Just say "HELP" when in danger</li>
            <li>✓ 📍 Location is automatically captured in real-time</li>
            <li>✓ 🔊 Loud siren alarm sounds (2000-3000 Hz for 1 minute)</li>
            <li>✓ 📱 SMS alerts sent to ALL stored emergency contacts</li>
            <li>✓ 🗺️ Location link included in message</li>
            <li>✓ 📋 Alert recorded in history</li>
            <li>✓ 🔄 System auto-restarts after 5 seconds</li>
          </ul>
        </div>

        <p className="text-sm text-red-600 mt-4 font-semibold text-center p-3 bg-red-50 border border-red-300 rounded">
          ⚡ Everything works automatically - no buttons to click! Just say "HELP" and the entire emergency protocol activates!
        </p>
      </div>
    </div>
  );
};

export default EmergencyAlert;
