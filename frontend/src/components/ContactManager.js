import React, { useState, useEffect } from 'react';
import { getContacts, addContact, deleteContact } from '../services/api';

const ContactManager = ({ onContactsUpdate }) => {
  const [contacts, setContacts] = useState([]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [contactName, setContactName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchContacts();
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
                className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border-2 border-green-300 hover:shadow-lg transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-xl font-bold text-gray-800">
                      👤 {contact.contact_name}
                    </p>
                    <p className="text-lg text-gray-600 font-semibold">
                      📞 {contact.phone_number}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteContact(contact.id)}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-all transform hover:scale-105 active:scale-95"
                  >
                    🗑️ Delete
                  </button>
                </div>
                <p className="text-sm text-gray-500">
                  Added: {new Date(contact.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactManager;
