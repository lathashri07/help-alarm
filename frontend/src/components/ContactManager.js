import React, { useState, useEffect } from 'react';
import { 
  getContacts, 
  addContact, 
  deleteContact, 
  getVapidPublicKey, 
  subscribeContact, 
  unsubscribeContact, 
  checkSubscription 
} from '../services/api';

const ContactManager = ({ onContactsUpdate }) => {
  const [contacts, setContacts] = useState([]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [contactName, setContactName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [subscribedContactId, setSubscribedContactId] = useState(null);
  const [pushSupported, setPushSupported] = useState(false);

  // Check if push is supported and if current browser is subscribed
  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setPushSupported(true);
      checkCurrentSubscription();
    }
  }, [contacts]);

  const checkCurrentSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        const data = await checkSubscription(subscription);
        setSubscribedContactId(data.subscribedContactId);
      } else {
        setSubscribedContactId(null);
      }
    } catch (error) {
      console.error('Error checking push subscription:', error);
    }
  };

  const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const handleSubscribe = async (contactId) => {
    try {
      setLoading(true);
      
      // 1. Request notification permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setMessage('⚠️ Push notification permission was denied');
        return;
      }

      // 2. Get active service worker registration
      const registration = await navigator.serviceWorker.ready;
      
      // 3. Get VAPID public key from backend
      const vapidPublicKey = await getVapidPublicKey();
      const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
      
      // 4. Subscribe the client
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey
      });
      
      // 5. Send subscription to server
      await subscribeContact(contactId, subscription);
      setSubscribedContactId(contactId);
      setMessage('✅ Device subscribed successfully! This browser will now receive safety push alerts.');
      fetchContacts();
      setTimeout(() => setMessage(''), 5000);
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      setMessage(`❌ Failed to subscribe: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    try {
      setLoading(true);
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        // Send unsubscribe request to server
        await unsubscribeContact(subscription);
        // Call browser unsubscribe
        await subscription.unsubscribe();
      }
      setSubscribedContactId(null);
      setMessage('✅ Unsubscribed this device from safety notifications.');
      fetchContacts();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error unsubscribing:', error);
      setMessage('❌ Failed to unsubscribe device');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const data = await getContacts();
      setContacts(data);
      onContactsUpdate(data);
    } catch (error) {
      setMessage('❌ Failed to fetch contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleAddContact = async (e) => {
    e.preventDefault();
    
    if (!phoneNumber.trim()) {
      setMessage('⚠️ Please enter a phone number');
      return;
    }

    setLoading(true);
    try {
      await addContact(phoneNumber, contactName || 'Unknown');
      setMessage('✅ Contact added successfully!');
      setPhoneNumber('');
      setContactName('');
      fetchContacts();
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Failed to add contact. Phone number may already exist.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteContact = async (id) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        await deleteContact(id);
        setMessage('✅ Contact deleted successfully!');
        fetchContacts();
        setTimeout(() => setMessage(''), 3000);
      } catch (error) {
        setMessage('❌ Failed to delete contact');
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Add Contact Form */}
      <div className="bg-white rounded-lg shadow-lg p-8 border-l-4 border-blue-600">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span className="text-3xl">➕</span>
          Add Emergency Contact
        </h2>

        {message && (
          <div className={`mb-6 p-4 rounded-lg font-semibold text-lg ${
            message.includes('✅')
              ? 'bg-green-100 text-green-800 border-2 border-green-500'
              : message.includes('❌')
              ? 'bg-red-100 text-red-800 border-2 border-red-500'
              : 'bg-yellow-100 text-yellow-800 border-2 border-yellow-500'
          }`}>
            {message}
          </div>
        )}

        <form onSubmit={handleAddContact} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              📞 Phone Number (Required)
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+1 (555) 123-4567"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              👤 Contact Name (Optional)
            </label>
            <input
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="e.g., Mom, Dad, Sister, Friend"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-105 active:scale-95 disabled:bg-gray-400 disabled:cursor-not-allowed text-lg"
          >
            {loading ? '⏳ Adding...' : '✅ Add Contact'}
          </button>
        </form>
      </div>

      {/* Contacts List */}
      <div className="bg-white rounded-lg shadow-lg p-8 border-l-4 border-green-600">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span className="text-3xl">👥</span>
          Emergency Contacts ({contacts.length})
        </h2>

        {contacts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              📭 No contacts added yet. Add your emergency contacts above.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border-2 border-green-300 hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-xl font-bold text-gray-800">
                        👤 {contact.contact_name}
                      </p>
                      <p className="text-lg text-gray-600 font-semibold">
                        📞 {contact.phone_number}
                      </p>
                      <p className="text-xs text-blue-600 font-bold mt-1 bg-blue-100 px-2 py-0.5 rounded-full inline-block">
                        📱 Subscribed Devices: {contact.device_count || 0}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteContact(contact.id)}
                      className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-all transform hover:scale-105 active:scale-95"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Added: {new Date(contact.created_at).toLocaleDateString()}
                  </p>
                </div>
                
                {/* Push Notifications Subscription Actions */}
                {pushSupported && (
                  <div className="mt-4 pt-4 border-t border-green-200">
                    {subscribedContactId === contact.id ? (
                      <div className="flex flex-col gap-2">
                        <div className="bg-purple-100 text-purple-800 text-sm font-bold p-2.5 rounded-lg border border-purple-300 flex items-center justify-between">
                          <span>🔔 Device is Subscribed</span>
                          <span className="animate-pulse">●</span>
                        </div>
                        <button
                          onClick={handleUnsubscribe}
                          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-3 rounded-lg text-sm transition-all active:scale-95"
                        >
                          🔕 Unsubscribe This Device
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleSubscribe(contact.id)}
                        disabled={loading}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-3 rounded-lg text-sm transition-all active:scale-95 disabled:bg-gray-400"
                      >
                        🔔 Receive Alerts on this Device
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactManager;
