import React, { useState, useEffect, useRef } from 'react';
import VoiceRecognition from './components/VoiceRecognition';
import ContactManager from './components/ContactManager';
import { LocationTracker, AlertStatus } from './components/EmergencyAlert';
import AlertHistory from './components/AlertHistory';
import Alarm from './components/Alarm';
import { getContacts, sendEmergencyAlert } from './services/api';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [contacts, setContacts] = useState([]);
  
  // Emergency Alert States lifted from EmergencyAlert
  const [location, setLocation] = useState(null);
  const [alertSending, setAlertSending] = useState(false);
  const [message, setMessage] = useState('');
  const [locationMessage, setLocationMessage] = useState('');
  const [lastAlert, setLastAlert] = useState(null);
  const [autoTriggered, setAutoTriggered] = useState(false);
  
  const alarmRef = useRef(null);

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => {
          console.log('Service Worker registered successfully on startup with scope:', reg.scope);
        })
        .catch(err => {
          console.warn('Service Worker registration on startup failed:', err);
        });
    }
    loadContacts();
    getLocationAuto();
  }, []);

  const loadContacts = async () => {
    try {
      const data = await getContacts();
      setContacts(data);
    } catch (error) {
      console.error('Failed to load initial contacts:', error);
    }
  };

  const handleContactsUpdate = (updatedContacts) => {
    setContacts(updatedContacts);
  };

  // Get location on mount
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

  // Trigger emergency protocol
  const handleEmergencyTrigger = async () => {
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
              smsResults: response.smsResults,
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-teal-950 to-indigo-950 text-slate-100 flex flex-col justify-between transition-all duration-500">
      {/* Header with Navigation Integration */}
      <header className="bg-slate-900/80 border-b border-white/10 backdrop-blur-md sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent flex items-center gap-3">
              {/* Peacock Feather SVG with Spiritual Shine */}
              <svg className="w-10 h-10 drop-shadow-[0_0_12px_rgba(34,211,238,0.9)] animate-pulse" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Stem/Quill */}
                <path d="M20 90C40 70 50 40 60 15" stroke="url(#stemGrad)" strokeWidth="3.5" strokeLinecap="round"/>
                
                {/* Barbules / Fluffs */}
                <path d="M50 30C35 35 22 25 28 15C34 5 48 20 50 30Z" fill="url(#featherGreen)" opacity="0.8"/>
                <path d="M60 15C55 28 66 38 76 32C86 26 70 18 60 15Z" fill="url(#featherGreen)" opacity="0.8"/>
                <path d="M43 48C28 52 18 42 24 32C30 22 41 37 43 48Z" fill="url(#featherGreen)" opacity="0.75"/>
                <path d="M56 28C50 42 62 52 72 46C82 40 66 32 56 28Z" fill="url(#featherGreen)" opacity="0.75"/>
                <path d="M38 64C23 68 13 58 18 48C23 38 35 52 38 64Z" fill="url(#featherGreen)" opacity="0.65"/>
                <path d="M50 43C44 58 55 68 65 62C75 56 60 47 50 43Z" fill="url(#featherGreen)" opacity="0.65"/>
                <path d="M33 78C20 80 12 72 16 64C20 56 31 69 33 78Z" fill="url(#featherGreen)" opacity="0.5"/>
                <path d="M44 58C38 72 47 80 55 75C63 70 52 60 44 58Z" fill="url(#featherGreen)" opacity="0.5"/>

                {/* Golden Eye */}
                <path d="M53 30C48 40 62 50 70 44C78 38 58 20 53 30Z" fill="#fbbf24"/>
                
                {/* Turquoise Eye */}
                <path d="M54 32C50 39 60 46 66 42C72 38 58 25 54 32Z" fill="#22d3ee"/>
                
                {/* Royal Blue Center */}
                <path d="M56 34C53 38 58 43 62 40C66 37 59 30 56 34Z" fill="#3b82f6"/>
                
                {/* Spiritual Shine Glow Dot */}
                <circle cx="58" cy="36" r="3.5" fill="#ffffff" className="animate-ping" style={{ animationDuration: '2.5s' }}/>
                <circle cx="58" cy="36" r="2" fill="#ffffff"/>

                <defs>
                  <linearGradient id="featherGreen" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#059669" />
                    <stop offset="50%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#34d399" />
                  </linearGradient>
                  <linearGradient id="stemGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#047857" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </svg>
              Help Alarm
            </h1>
            <p className="text-slate-400 mt-0.5 font-medium text-xs md:text-sm">
              Intelligent Emergency Alert System
            </p>
          </div>

          <nav className="flex gap-2 py-1 flex-wrap items-center">
            {[
              { id: 'home', label: 'Home', icon: '🏠' },
              { id: 'contacts', label: 'Contacts', icon: '👥' },
              { id: 'history', label: 'History', icon: '⏱️' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-cyan-500/20 to-teal-500/20 text-cyan-300 border border-cyan-500/35 shadow-md shadow-cyan-950/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8 w-full flex-grow">
        {/* Home Tab - Redesigned Symmetrical 2x2 Grid Layout */}
        {activeTab === 'home' && (
          <div className="space-y-8">
            {/* Auto-triggered Status banner */}
            {autoTriggered && (
              <div className="bg-gradient-to-r from-rose-600 to-orange-600 rounded-2xl shadow-2xl p-8 border border-rose-500/30 animate-pulse text-white">
                <div className="text-center">
                  <p className="text-3xl md:text-4xl font-black mb-2 tracking-wide">🚨 EMERGENCY PROTOCOL ACTIVATED!</p>
                  <p className="text-lg md:text-xl font-bold animate-bounce text-rose-100">Sending alert to all contacts...</p>
                </div>
              </div>
            )}

            {/* Symmetrical 2-Column Responsive Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {/* Row 1: Voice Detection (Left) & Alarm System (Right) */}
              <VoiceRecognition alarmRef={alarmRef} onTriggerAlert={handleEmergencyTrigger} />
              
              <Alarm ref={alarmRef} />

              {/* Row 2: Location Tracking (Left - Under Voice Detection) & Status (Right - Under Alarm) */}
              <LocationTracker 
                location={location}
                locationMessage={locationMessage}
                alertSending={alertSending}
                onTriggerAlert={handleEmergencyTrigger}
              />

              <AlertStatus 
                contacts={contacts}
                lastAlert={lastAlert}
                message={message}
              />
            </div>
          </div>
        )}

        {/* Contacts Tab */}
        {activeTab === 'contacts' && (
          <ContactManager onContactsUpdate={handleContactsUpdate} />
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <AlertHistory />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-950/80 border-t border-white/5 text-slate-400 py-8">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-4 items-center justify-between">
          <div className="text-center md:text-left">
            <p className="text-slate-300 font-semibold tracking-wide flex items-center justify-center md:justify-start gap-2 text-sm md:text-base">
              <span>🪶</span> Help Alarm &mdash; Intelligent Safety
            </p>
            <p className="text-slate-500 text-xs mt-1">
              Your safety assistant powered by real-time voice and push diagnostics.
            </p>
          </div>
          <div className="text-center md:text-right text-xs md:text-sm text-slate-500 space-y-1">
            <p>&copy; {new Date().getFullYear()} Help Alarm. All rights reserved.</p>
            <p className="hover:text-cyan-400 transition-colors cursor-pointer">Always ensure emergency contacts are active.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
