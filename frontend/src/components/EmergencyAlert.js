import React, { useState, useEffect } from 'react';
import { sendEmergencyAlert } from '../services/api';

const EmergencyAlert = ({ contacts }) => {
  const [location, setLocation] = useState(null);
  const [alertSending, setAlertSending] = useState(false);
  const [message, setMessage] = useState('');
  const [locationMessage, setLocationMessage] = useState('');

  useEffect(() => {
    // Listen for emergency alert trigger from voice recognition
    window.addEventListener('triggerEmergencyAlert', handleTriggerAlert);

    return () => {
      window.removeEventListener('triggerEmergencyAlert', handleTriggerAlert);
    };
  }, [location, contacts]);

  const getLocation = () => {
    setLocationMessage('📍 Getting your location...');
    
    if (!navigator.geolocation) {
      setLocationMessage('❌ Geolocation not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
        setLocationMessage(
          `✅ Location found! Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`
        );
      },
      (error) => {
        setLocationMessage(`❌ Error getting location: ${error.message}`);
        console.error('Geolocation error:', error);
      }
    );
  };

  const handleTriggerAlert = async () => {
    if (!location) {
      console.log('Location not available for auto-alert');
      return;
    }
    
    await sendEmergencyAlert(
      location.latitude,
      location.longitude,
      'EMERGENCY! "HELP" detected via voice recognition'
    );
  };

  const handleManualAlert = async () => {
    if (!location) {
      setMessage('⚠️ Please get your location first');
      return;
    }

    if (contacts.length === 0) {
      setMessage('⚠️ Please add emergency contacts first');
      return;
    }

    setAlertSending(true);
    setMessage('📤 Sending emergency alert...');

    try {
      const response = await sendEmergencyAlert(
        location.latitude,
        location.longitude,
        'EMERGENCY ALERT! Location and emergency message sent.'
      );

      setMessage(
        `✅ Emergency alert sent to ${response.contactsNotified} contact(s)!\n` +
        `📍 Location: ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
      );

      setTimeout(() => setMessage(''), 5000);
    } catch (error) {
      setMessage('❌ Failed to send emergency alert');
      console.error('Error sending alert:', error);
    } finally {
      setAlertSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Location Manager */}
      <div className="bg-white rounded-lg shadow-lg p-8 border-l-4 border-purple-600">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span className="text-3xl">📍</span>
          Location Tracking
        </h2>

        {locationMessage && (
          <div className={`mb-6 p-4 rounded-lg font-semibold text-lg ${
            locationMessage.includes('✅')
              ? 'bg-green-100 text-green-800 border-2 border-green-500'
              : locationMessage.includes('❌')
              ? 'bg-red-100 text-red-800 border-2 border-red-500'
              : 'bg-blue-100 text-blue-800 border-2 border-blue-300'
          }`}>
            {locationMessage}
          </div>
        )}

        {location && (
          <div className="mb-6 p-4 bg-green-50 border-2 border-green-300 rounded-lg">
            <p className="text-green-800 font-semibold text-lg mb-2">📌 Current Location:</p>
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
                className="underline hover:text-green-800"
              >
                View on Google Maps →
              </a>
            </p>
          </div>
        )}

        <button
          onClick={getLocation}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-105 active:scale-95 text-lg"
        >
          📍 Get My Location
        </button>
      </div>

      {/* Emergency Alert Trigger */}
      <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg shadow-lg p-8 border-4 border-red-600">
        <h2 className="text-3xl font-bold text-red-700 mb-6 flex items-center gap-2 animate-pulse">
          <span className="text-4xl">🆘</span>
          Send Emergency Alert
        </h2>

        {message && (
          <div className={`mb-6 p-4 rounded-lg font-semibold text-lg whitespace-pre-line ${
            message.includes('✅')
              ? 'bg-green-100 text-green-800 border-2 border-green-500'
              : message.includes('❌')
              ? 'bg-red-100 text-red-800 border-2 border-red-500'
              : 'bg-yellow-100 text-yellow-800 border-2 border-yellow-500'
          }`}>
            {message}
          </div>
        )}

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

        <button
          onClick={handleManualAlert}
          disabled={alertSending || !location || contacts.length === 0}
          className={`w-full font-bold py-4 rounded-lg transition-all transform text-white text-xl font-bold ${
            alertSending || !location || contacts.length === 0
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-red-600 hover:bg-red-700 active:scale-95 hover:scale-105'
          }`}
        >
          {alertSending ? '⏳ Sending Alert...' : '📤 Send Emergency Alert Now'}
        </button>

        <p className="text-sm text-red-600 mt-4 font-semibold">
          💡 Tip: This alert will automatically send when you say "HELP" and the alarm sounds.
        </p>
      </div>
    </div>
  );
};

export default EmergencyAlert;
