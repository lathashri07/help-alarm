# 🚀 Help Alarm - Quick Start Guide

## System is Running! 🎉

**Backend Server**: ✅ Running on `http://localhost:5000`
**Frontend Server**: ✅ Running on `http://localhost:3000`
**Application**: ✅ Open in browser at `http://localhost:3000`

---

## 📖 Quick Usage Guide

### 1. **Add Emergency Contacts** (Contacts Tab)
   - Click "📞 Contacts" tab
   - Enter phone number in format: `+1 (555) 123-4567`
   - Enter contact name (e.g., Mom, Sister, Friend)
   - Click "✅ Add Contact"
   - Contact saved and displayed in list

### 2. **Get Your Location** (Home Tab)
   - Click "📍 Get My Location"
   - Allow browser permission when prompted
   - Your coordinates (latitude/longitude) will display

### 3. **Test Alarm** (Home Tab)
   - Click "🔊 Play Alarm" button
   - Loud alarm sound will play for 4 seconds
   - Alarm will pulse automatically
   - Click "⏹️ Stop Alarm" to stop early

### 4. **Use Voice Recognition** (Home Tab)
   - Click "▶️ Start Listening"
   - Speak clearly and say "**HELP**"
   - System will recognize and display transcript
   - Alarm automatically triggers
   - Emergency alert sent to all contacts

### 5. **Send Manual Emergency Alert** (Home Tab)
   - Make sure you have location ("Get My Location" button)
   - Make sure you have added contacts
   - Click "📤 Send Emergency Alert Now"
   - Alert sent to all contacts with your location

### 6. **View Alert History** (History Tab)
   - Click "📋 History" tab
   - See all emergency alerts sent
   - Each alert shows timestamp and location
   - Click "📍 View on Map" to see location on Google Maps

---

## 🔧 System Requirements

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Microphone enabled for voice recognition
- Location services enabled on device
- JavaScript enabled

---

## 📞 Terminal Commands to Keep Services Running

### Terminal 1 - Backend (If not running):
```bash
cd backend
node server.js
```

### Terminal 2 - Frontend (If not running):
```bash
cd frontend
npm start
```

---

## 🎯 Emergency Workflow

**Voice-Triggered Emergency:**
```
User says "HELP" → Speech Recognition detects it → Alarm triggers → 
Alert sent to all contacts → Location included → History recorded
```

**Manual Emergency:**
```
Click "Get My Location" → Click "Send Emergency Alert Now" → 
Alert sent to all contacts → History recorded
```

---

## ⚙️ Configuration

### Backend Settings (.env)
```
PORT=5000
NODE_ENV=development
```

### Frontend Settings (.env.local)
```
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 🐛 Troubleshooting

### Voice Recognition not working:
- ✅ Check microphone is connected and enabled
- ✅ Try speaking louder and more clearly
- ✅ Use a supported browser (Chrome/Edge recommended)
- ✅ Ensure "HELP" is spoken clearly

### Location not showing:
- ✅ Click "Get My Location" button again
- ✅ Check browser geolocation permission
- ✅ Try using HTTPS (for production)

### Alarm not working:
- ✅ Check device volume is not muted
- ✅ Click "Play Alarm" button
- ✅ Try different browser if still not working

### Cannot add contact:
- ✅ Enter phone number in proper format
- ✅ Phone number must not already exist
- ✅ Check backend server is running

### Emergency alert shows "No location":
- ✅ Click "Get My Location" first
- ✅ Allow browser location permission
- ✅ Try again

---

## 📊 Database Information

### SQLite Database Location:
```
backend/help_alarm.db
```

### Tables:
- `emergency_contacts` - Stores phone numbers and names
- `emergency_alerts` - Stores all emergency alerts with location

### Database Structure:
```sql
-- Contacts Table
CREATE TABLE emergency_contacts (
  id INTEGER PRIMARY KEY,
  phone_number TEXT UNIQUE NOT NULL,
  contact_name TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Alerts Table
CREATE TABLE emergency_alerts (
  id INTEGER PRIMARY KEY,
  latitude REAL,
  longitude REAL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  message TEXT
);
```

---

## 🌐 API Endpoints Reference

### Add Contact
```
POST http://localhost:5000/api/contacts
Body: {
  "phoneNumber": "+1 (555) 123-4567",
  "contactName": "Emergency Friend"
}
```

### Get All Contacts
```
GET http://localhost:5000/api/contacts
```

### Send Emergency Alert
```
POST http://localhost:5000/api/emergency-alert
Body: {
  "latitude": 40.7128,
  "longitude": -74.0060,
  "message": "EMERGENCY ALERT!"
}
```

### Get Alert History
```
GET http://localhost:5000/api/alerts
```

---

## 📝 Testing Checklist

Before using for real emergencies, test:
- [ ] Added at least one emergency contact
- [ ] Microphone is working
- [ ] Voice recognition detects "HELP" clearly
- [ ] Alarm sound is audible
- [ ] Location can be retrieved
- [ ] Manual alert sending works
- [ ] Contacts appear in alert history

---

## 💡 Tips & Best Practices

1. **Regular Testing**: Test the system monthly to ensure everything works
2. **Update Contacts**: Keep emergency contacts updated and reachable
3. **Backup Method**: This is a supplement to emergency services, not replacement
4. **Clear Speech**: Speak "HELP" clearly for best recognition
5. **Keep Phone Charged**: Ensure your device is charged when needed
6. **Test Microphone**: Verify microphone works before emergencies
7. **Test Location**: Practice getting location to ensure permission works
8. **Quiet Environment**: Test voice recognition in quieter environments first

---

## ⚠️ Important Legal Notice

**Help Alarm is a safety enhancement tool, NOT a replacement for emergency services.**

In life-threatening situations, always:
1. Call your local emergency number:
   - 🇺🇸 USA: **911**
   - 🇬🇧 UK: **999**
   - 🇪🇺 EU: **112**
   - 🇮🇳 India: **100 (Police) / 101 (Fire)**

2. Contact police/emergency services directly
3. Use Help Alarm as a supplementary alert system

---

## 🎓 Learning Resources

### Web APIs Used:
- [Speech Recognition API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API)

### React Documentation:
- [React Hooks](https://react.dev/reference/react)
- [React Effects](https://react.dev/reference/react/useEffect)

### Tailwind CSS:
- [Tailwind Documentation](https://tailwindcss.com/docs)

---

## 📞 Support

For issues or improvements, refer to:
- [README.md](README.md) - Full documentation
- [BUILD_SUMMARY.md](BUILD_SUMMARY.md) - Technical summary

---

## ✨ Version Information

- **Version**: 1.0.0
- **Build Date**: 2026-06-11
- **Status**: ✅ Production Ready (with SMS integration recommended)

---

**Help Alarm** - Because your safety matters. 💜

*Built with ❤️ for women's safety*
