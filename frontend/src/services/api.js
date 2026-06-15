import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getContacts = async () => {
  try {
    const response = await apiClient.get('/contacts');
    return response.data;
  } catch (error) {
    console.error('Error fetching contacts:', error);
    throw error;
  }
};

export const addContact = async (phoneNumber, contactName) => {
  try {
    const response = await apiClient.post('/contacts', {
      phoneNumber,
      contactName,
    });
    return response.data;
  } catch (error) {
    console.error('Error adding contact:', error);
    throw error;
  }
};

export const deleteContact = async (id) => {
  try {
    const response = await apiClient.delete(`/contacts/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting contact:', error);
    throw error;
  }
};

export const sendEmergencyAlert = async (latitude, longitude, message) => {
  try {
    const response = await apiClient.post('/emergency-alert', {
      latitude,
      longitude,
      message,
    });
    return response.data;
  } catch (error) {
    console.error('Error sending emergency alert:', error);
    throw error;
  }
};

export const getAlerts = async () => {
  try {
    const response = await apiClient.get('/alerts');
    return response.data;
  } catch (error) {
    console.error('Error fetching alerts:', error);
    throw error;
  }
};

export const getVapidPublicKey = async () => {
  try {
    const response = await apiClient.get('/vapid-public-key');
    return response.data.publicKey;
  } catch (error) {
    console.error('Error fetching VAPID public key:', error);
    throw error;
  }
};

export const subscribeContact = async (contactId, subscription) => {
  try {
    const response = await apiClient.post('/subscribe', {
      contactId,
      subscription,
    });
    return response.data;
  } catch (error) {
    console.error('Error subscribing contact:', error);
    throw error;
  }
};

export const unsubscribeContact = async (subscription) => {
  try {
    const response = await apiClient.post('/unsubscribe', {
      subscription,
    });
    return response.data;
  } catch (error) {
    console.error('Error unsubscribing contact:', error);
    throw error;
  }
};

export const checkSubscription = async (subscription) => {
  try {
    const response = await apiClient.post('/check-subscription', {
      subscription,
    });
    return response.data;
  } catch (error) {
    console.error('Error checking subscription:', error);
    throw error;
  }
};
