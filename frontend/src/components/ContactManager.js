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
      <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl p-8 hover:border-cyan-500/20 transition-all duration-300">
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-100 mb-6 flex items-center gap-2">
          <span className="text-2xl md:text-3xl">➕</span>
          Add Emergency Contact
        </h2>

        {message && (
          <div className={`mb-6 p-4 rounded-xl font-semibold text-sm md:text-base border ${
            message.includes('✅')
              ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/35'
              : message.includes('❌')
              ? 'bg-rose-950/40 text-rose-300 border-rose-500/35'
              : 'bg-amber-950/40 text-amber-300 border-amber-500/35'
          }`}>
            {message}
          </div>
        )}

        <form onSubmit={handleAddContact} className="space-y-5">
          <div>
            <label className="block text-slate-300 font-semibold mb-2 text-sm md:text-base">
              📞 Phone Number (Required)
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+1 (555) 123-4567"
              className="w-full px-4 py-3 bg-slate-950/60 border border-white/10 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-405 focus:ring-1 focus:ring-cyan-400 transition-all text-sm md:text-base"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-2 text-sm md:text-base">
              👤 Contact Name (Optional)
            </label>
            <input
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="e.g., Mom, Dad, Sister, Friend"
              className="w-full px-4 py-3 bg-slate-950/60 border border-white/10 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-405 focus:ring-1 focus:ring-cyan-400 transition-all text-sm md:text-base"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-white font-extrabold py-3.5 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-base md:text-lg shadow-lg shadow-cyan-500/10"
          >
            {loading ? '⏳ Adding...' : '✅ Add Contact'}
          </button>
        </form>
      </div>

      {/* Contacts List */}
      <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl p-8 hover:border-cyan-500/20 transition-all duration-300">
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-100 mb-6 flex items-center gap-2">
          <span className="text-2xl md:text-3xl">👥</span>
          Emergency Contacts ({contacts.length})
        </h2>

        {contacts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400 text-base md:text-lg font-medium">
              📭 No contacts added yet. Add your emergency contacts above.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                className="bg-slate-950/40 p-6 rounded-xl border border-white/5 hover:border-cyan-500/25 transition-all duration-300 flex flex-col justify-between hover:shadow-lg hover:shadow-cyan-950/20"
              >
                <div>
                  <div className="flex justify-between items-start gap-4 mb-4">
                    <div className="space-y-1">
                      <p className="text-lg md:text-xl font-bold text-slate-100">
                        👤 {contact.contact_name}
                      </p>
                      <p className="text-base md:text-lg text-cyan-400 font-semibold font-mono">
                        📞 {contact.phone_number}
                      </p>
                      <p className="text-[10px] md:text-xs text-indigo-300 font-bold mt-2 bg-indigo-950/60 border border-indigo-500/30 px-3 py-1 rounded-full inline-block">
                        📱 Subscribed Devices: {contact.device_count || 0}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteContact(contact.id)}
                      className="text-xs md:text-sm text-rose-400 hover:text-white border border-rose-500/35 hover:bg-rose-600 font-bold py-2 px-3 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                  <p className="text-[10px] md:text-xs text-slate-500 font-medium">
                    Added: {new Date(contact.created_at).toLocaleDateString()}
                  </p>
                </div>
                
                {/* Push Notifications Subscription Actions */}
                {pushSupported && (
                  <div className="mt-4 pt-4 border-t border-white/5">
                    {subscribedContactId === contact.id ? (
                      <div className="flex flex-col gap-2">
                        <div className="bg-indigo-950/40 text-indigo-300 text-xs md:text-sm font-bold p-2.5 rounded-xl border border-indigo-500/30 flex items-center justify-between">
                          <span>🔔 Device is Subscribed</span>
                          <span className="animate-pulse text-indigo-400">●</span>
                        </div>
                        <button
                          onClick={handleUnsubscribe}
                          className="w-full bg-gradient-to-r from-rose-600/30 to-red-600/30 hover:from-rose-600/50 hover:to-red-600/50 border border-rose-500/35 text-rose-200 font-bold py-2 px-3 rounded-lg text-xs md:text-sm transition-all active:scale-95"
                        >
                          🔕 Unsubscribe This Device
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleSubscribe(contact.id)}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold py-2 px-3 rounded-lg text-xs md:text-sm transition-all active:scale-95 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 shadow-md shadow-indigo-600/25"
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
