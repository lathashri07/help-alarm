# Help Alarm - Emergency Alert System

A web-based emergency alert system designed to help women in danger situations. The system uses voice recognition to detect the word "HELP", triggers an alarm, captures location, and sends emergency alerts to pre-configured contacts.

## 🚨 Features

- **🎤 Voice Recognition**: Automatic Speech Recognition (ASR) listens for the word "HELP"
- **🔔 Web Audio API**: Produces loud alarm sounds when emergency is detected
- **📍 Browser Geolocation**: Captures user's current GPS location
- **📱 Emergency Contacts**: Store and manage loved ones' phone numbers
- **📤 Emergency Alerts**: Send location and emergency message to all contacts
- **📋 Alert History**: View all emergency alerts sent with timestamps and locations
- **🎨 Modern UI**: React + Tailwind CSS for responsive, user-friendly interface

## 📋 Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **SQLite** - Database for storing contacts and alerts
- **CORS** - Cross-origin resource sharing

### Frontend
- **React** - UI library
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API calls
- **Web Audio API** - For alarm sound generation
- **Speech Recognition API** - For voice input

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Modern web browser with microphone support

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Start the backend server:
```bash
npm start
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the React development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## 📖 How to Use

1. **Add Emergency Contacts**
   - Go to the "Contacts" tab
   - Enter phone numbers and names of loved ones
   - Click "Add Contact"

2. **Get Your Location**
   - On the "Home" tab, click "Get My Location"
   - Allow browser permission to access your location
   - Your coordinates will be displayed

3. **Use Voice Recognition**
   - Click "Start Listening"
   - Say "HELP" clearly
   - The system will detect it and trigger the alarm
   - Emergency alert will be sent to all contacts with your location

4. **Manual Emergency Alert**
   - Click "Send Emergency Alert Now" to manually send alert
   - Make sure you have location and contacts added

5. **View Alert History**
   - Go to the "History" tab
   - See all emergency alerts with locations and timestamps
   - Click "View on Map" to see the location on Google Maps

## 🔒 Security & Privacy

- All data is stored locally on your device
- Phone numbers are only used for emergency alerts
- Location is only captured when you explicitly request it
- All communications use standard web APIs

## 🌐 Browser Support

- Chrome/Chromium (v25+) - Full support
- Firefox (v25+) - Full support
- Safari (v14.1+) - Full support
- Edge (v79+) - Full support

**Note:** Speech Recognition API support varies by browser and language.

## 📱 API Endpoints

### Contacts
- `GET /api/contacts` - Get all emergency contacts
- `POST /api/contacts` - Add new contact
- `DELETE /api/contacts/:id` - Delete contact

### Emergency
- `POST /api/emergency-alert` - Send emergency alert with location
- `GET /api/alerts` - Get alert history

## 🛠️ Troubleshooting

### Voice Recognition not working
- Check microphone permissions
- Try using a supported browser
- Speak clearly and loudly
- Say "HELP" clearly

### Location not available
- Allow browser permission to access location
- Check if geolocation is enabled on your device
- Try using HTTPS (required for geolocation)

### Backend connection issues
- Ensure backend is running on port 5000
- Check CORS settings
- Verify frontend `.env.local` has correct API URL

## 📝 Environment Variables

### Backend (.env)
```
PORT=5000
NODE_ENV=development
```

### Frontend (.env.local)
```
REACT_APP_API_URL=http://localhost:5000/api
```

## 📁 Project Structure

```
help-alarm/
├── backend/
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── App.js
│   │   ├── index.js
│   │   ├── index.css
│   │   ├── components/
│   │   │   ├── VoiceRecognition.js
│   │   │   ├── Alarm.js
│   │   │   ├── ContactManager.js
│   │   │   ├── EmergencyAlert.js
│   │   │   └── AlertHistory.js
│   │   └── services/
│   │       └── api.js
│   ├── public/
│   │   └── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── postcss.config.js
└── README.md
```

## 🤝 Contributing

This project is designed to help save lives. Feel free to contribute improvements!

## ⚖️ License

This project is open source and available for everyone.

## ⚠️ Important Notes

1. **Test Thoroughly**: Always test voice recognition and location features before an actual emergency
2. **Keep Contacts Updated**: Regularly update your emergency contacts list
3. **Backup Method**: Have a backup way to contact emergency services
4. **Regular Testing**: Periodically test the system to ensure it's working
5. **HTTPS**: For production use, deploy on HTTPS (required for geolocation API)

## 🆘 Emergency Services

This app is a supplement to professional emergency services, NOT a replacement. Always call your local emergency number (911 in US, 112 in EU, etc.) in life-threatening situations.

---

**Help Alarm** - Because your safety matters. 💜

For issues, suggestions, or improvements, please reach out!
