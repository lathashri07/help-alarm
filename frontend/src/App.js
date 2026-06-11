import React, { useState } from 'react';
import VoiceRecognition from './components/VoiceRecognition';
import ContactManager from './components/ContactManager';
import EmergencyAlert from './components/EmergencyAlert';
import AlertHistory from './components/AlertHistory';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [contacts, setContacts] = useState([]);

  const handleContactsUpdate = (updatedContacts) => {
    setContacts(updatedContacts);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-red-600 to-red-700 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-4xl font-bold text-white flex items-center gap-3">
            <span className="text-4xl">🆘</span>
            Help Alarm
          </h1>
          <p className="text-red-100 mt-2">Emergency Alert System - Your Safety, Our Priority</p>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4">
          <nav className="flex gap-0 flex-wrap">
            {[
              { id: 'home', label: '🏠 Home', icon: '🔴' },
              { id: 'contacts', label: '📞 Contacts', icon: '👥' },
              { id: 'history', label: '📋 History', icon: '⏱️' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 font-semibold text-lg transition-colors ${
                  activeTab === tab.id
                    ? 'border-b-4 border-red-600 text-red-600 bg-red-50'
                    : 'text-gray-600 hover:text-red-600 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Home Tab - Voice Recognition & Emergency Alert */}
        {activeTab === 'home' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <VoiceRecognition />
            <EmergencyAlert contacts={contacts} />
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
      <footer className="bg-gray-800 text-white mt-12 py-6">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-gray-400">
            Help Alarm - Emergency Alert System | 24/7 Safety Support
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Always ensure your emergency contacts are updated and reachable.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
