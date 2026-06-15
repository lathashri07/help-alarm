# SMS Configuration & Testing Guide
## Help Alarm - Microsoft Azure Communication Services Integration

---

## 🎯 Overview

This guide explains how to:
1. ✅ Test SMS in **DEMO MODE** (no Azure account needed)
2. ✅ Configure real SMS with **Azure Communication Services**
3. ✅ Monitor SMS delivery and status

---

## 🧪 DEMO MODE (No Configuration Needed)

### What is Demo Mode?

- ✅ Simulates SMS sending
- ✅ Logs messages to console
- ✅ Shows contact phone numbers
- ✅ Displays message content
- ✅ Perfect for testing
- ❌ Does not send real SMS

### How to Test in Demo Mode:

#### Step 1: Ensure Backend is Running
```bash
cd backend
node server.js
```

**Expected output:**
```
Connected to SQLite database
Database tables initialized
Help Alarm Backend running on http://localhost:5000
Azure SMS not configured - will use demo mode
```

#### Step 2: Add Emergency Contact
1. Open http://localhost:3000
2. Go to "Contacts" tab
3. Add contact:
   - Phone: +91 9353904659 (any E.164 format)
   - Name: Dad (or any name)
4. Click "✅ Add Contact"

#### Step 3: Trigger Emergency Alert
**Option A - Manual Test:**
1. Use browser DevTools to manually call the alert API
2. Or go to frontend and simulate the event

**Option B - Automatic (when voice works):**
1. Say "HELP" when microphone is active
2. System auto-triggers alert

#### Step 4: Check Console Output

**Backend Console Shows:**
```
📱 DEMO MODE - SMS would be sent to:
  📞 Dad: +91 9353904659
  📝 Message: 🆘 EMERGENCY ALERT! Your loved one is in danger! 
📍 Location: 40.7128, -74.0060 
🗺️ View: https://maps.google.com/?q=40.7128,-74.0060
📞 Call emergency services immediately!
```

**Browser Console Shows:**
```
Emergency alert response: {
  alertId: 1,
  location: {latitude: 40.7128, longitude: -74.0060},
  contactsNotified: 1,
  smsResults: [
    {
      contact: "Dad",
      phone: "+91 9353904659",
      status: "demo-sent",
      message: "Demo mode - SMS sending not configured"
    }
  ]
}
```

### Demo Mode Status Codes:

| Status | Meaning | Action |
|--------|---------|--------|
| `demo-sent` | Message simulated | SMS not actually sent |
| `sent` | Real SMS sent | (when Azure configured) |
| `failed` | SMS failed | Check error message |

---

## 🔧 Real SMS Setup with Azure

### Prerequisites:
- ✅ Azure account (free tier available)
- ✅ Active subscription
- ✅ Credit card for verification
- ✅ 5-10 minutes of setup time

### Step 1: Create Azure Communication Services

#### Option A: Azure Portal (Visual)

1. Go to https://portal.azure.com
2. Click "Create a resource"
3. Search for "Communication Services"
4. Click on it
5. Click "Create"

#### Configuration Details:
- **Subscription**: Select your subscription
- **Resource Group**: Create new or select existing
- **Resource Name**: `help-alarm-sms` (any name)
- **Data Location**: Select your region (e.g., East US)

6. Click "Review + create"
7. Click "Create"
8. Wait 2-3 minutes for deployment

#### Option B: Azure CLI (Advanced)

```bash
# Login to Azure
az login

# Create resource group
az group create \
  --name help-alarm-rg \
  --location eastus

# Create Communication Services
az communication create \
  --name help-alarm-sms \
  --resource-group help-alarm-rg
```

### Step 2: Get Connection String

1. In Azure Portal, go to your Communication Services resource
2. Click "Settings" → "Keys"
3. Copy the "Connection String"
4. Save it safely (looks like this):
```
endpoint=https://help-alarm-sms.communication.azure.com/;accesskey=abcdef123456==
```

### Step 3: Provision SMS-Enabled Phone Number

1. In Communication Services, click "Manage phone numbers"
2. Click "Get a phone number"
3. Select:
   - **Country/Region**: Your country
   - **Phone plan**: Select "SMS/Calling" or "SMS only"
   - **Quantity**: 1
4. Click "Next"
5. Review pricing (usually free tier available)
6. Click "Get phone number"
7. Copy the phone number (format: +1234567890)

**Note**: May take 5-10 minutes to activate

### Step 4: Configure Backend (.env)

1. Create `.env` file in `backend/` directory:

```bash
cd backend
touch .env
```

2. Add your credentials:

```env
# Azure Communication Services
AZURE_CONNECTION_STRING=endpoint=https://help-alarm-sms.communication.azure.com/;accesskey=your-key-here
SMS_FROM_NUMBER=+1234567890

# Other config
PORT=5000
NODE_ENV=production
```

3. **Important**: Do NOT commit `.env` to git!

### Step 5: Verify Installation

```bash
# Check if Azure packages are installed
cd backend
npm list @azure/communication-sms

# Should show:
# @azure/communication-sms@1.1.0
```

If missing, install:
```bash
npm install @azure/communication-sms @azure/identity
```

### Step 6: Restart Backend

```bash
# Stop old backend (Ctrl+C)
# Then restart:
cd backend
node server.js
```

**Expected output:**
```
Connected to SQLite database
Database tables initialized
Azure Communication Services SMS Client initialized
Help Alarm Backend running on http://localhost:5000
```

### Step 7: Test Real SMS

1. Open http://localhost:3000
2. Update contact phone number to your REAL phone
3. Say "HELP" or trigger emergency alert
4. **Check your phone for SMS message!**

---

## 📱 SMS Message Details

### Message Format:

```
🆘 EMERGENCY ALERT! Your loved one is in danger! 
📍 Location: 40.7128, -74.0060 
🗺️ View: https://maps.google.com/?q=40.7128,-74.0060
📞 Call emergency services immediately!
```

### Message Components:

| Component | Purpose | Example |
|-----------|---------|---------|
| Header | Alert indicator | 🆘 EMERGENCY ALERT! |
| Danger message | Context | Your loved one is in danger! |
| Location | Exact coordinates | 40.7128, -74.0060 |
| Maps link | Clickable location | https://maps.google.com/?q=... |
| CTA | Call to action | Call emergency services immediately! |

### Character Count:
- Total: ~180 characters
- Standard SMS: 160 characters (may use 2 SMS)
- Cost: Usually 1-2 SMS credits per contact

---

## ✅ Testing Scenarios

### Scenario 1: Demo Mode Test

```
SETUP:
- No Azure credentials configured
- Backend in demo mode
- Phone number: +91 9353904659
- Contact: Dad

TRIGGER:
- Click "Play Alarm" or say "HELP"

VERIFICATION:
✅ Backend console shows demo SMS log
✅ Frontend shows SMS status "demo-sent"
✅ No actual SMS sent to phone
✅ Alert recorded in history
```

### Scenario 2: Real SMS Test

```
SETUP:
- Azure credentials configured
- Real SMS phone number from Azure
- Real contact phone number
- Backend running with SMS client

TRIGGER:
- Say "HELP" when microphone active
- System captures location
- Backend receives emergency alert

VERIFICATION:
✅ Check phone for SMS within 30 seconds
✅ SMS contains location link
✅ Can click link to see location
✅ Frontend shows "sent" status
✅ Backend logs show message ID
✅ Alert recorded with SMS delivery status
```

### Scenario 3: Error Handling Test

```
CASE A: Invalid Phone Number
- Format: abc (not E.164)
- Expected: SMS fails, error logged
- Status: "failed"

CASE B: Azure Credentials Wrong
- Invalid connection string
- Expected: SMS fails gracefully
- Falls back to: Demo mode
- Status: "demo-sent"

CASE C: Network Error
- Backend offline
- Expected: Frontend shows error
- Message: "Failed to send alert"
- Status: User can retry
```

---

## 🔍 Troubleshooting

### Issue: "SMS sending not configured"

**Problem**: Demo mode is active when you want real SMS

**Solution**:
1. Check `.env` file exists in `backend/` directory
2. Verify `AZURE_CONNECTION_STRING` is set
3. Verify `SMS_FROM_NUMBER` is set
4. Restart backend: `node server.js`
5. Check for "SMS Client initialized" message

### Issue: "Cannot find module @azure/communication-sms"

**Problem**: Package not installed

**Solution**:
```bash
cd backend
npm install @azure/communication-sms @azure/identity
npm list @azure/communication-sms
```

### Issue: SMS not received on phone

**Problem**: Real SMS not arriving

**Checklist**:
- [ ] Phone number configured correctly in Azure
- [ ] SMS-enabled plan selected
- [ ] Contact phone number in correct format (+country-code-number)
- [ ] Azure subscription active
- [ ] SMS credits available
- [ ] Backend logs show "sent" status
- [ ] Wait 30-60 seconds (SMS can be delayed)
- [ ] Check spam folder

### Issue: "Address already in use :::5000"

**Problem**: Backend already running on port 5000

**Solution**:
```bash
# Find process
netstat -ano | findstr :5000

# Kill process (Windows)
taskkill /PID <PID> /F

# Or use different port
PORT=5001 node server.js
```

### Issue: "User denied Geolocation"

**Problem**: Location permission not granted

**Solution**:
1. Click site settings icon (next to URL)
2. Find "Location" setting
3. Change to "Allow"
4. Reload page
5. Grant permission when prompted

---

## 📊 Monitoring & Debugging

### Backend Console Logging

Enable detailed logging:

```javascript
// In server.js, add before app.listen:
console.log('🔍 SMS Configuration Check:');
console.log('  Connection String:', AZURE_CONNECTION_STRING ? '✅ Set' : '❌ Missing');
console.log('  SMS From Number:', SMS_FROM_NUMBER);
console.log('  SMS Client:', smsClient ? '✅ Active' : '❌ Not active');
```

### Check SMS Status API

```bash
# View alert history (includes SMS status)
curl http://localhost:5000/api/alerts
```

**Response includes**:
```json
{
  "id": 1,
  "latitude": 40.7128,
  "longitude": -74.0060,
  "timestamp": "2026-06-11T11:45:00Z",
  "message": "EMERGENCY...",
  "smsResults": [
    {
      "contact": "Dad",
      "phone": "+91 9353904659",
      "status": "sent",
      "messageId": "abc123def456"
    }
  ]
}
```

### Monitor Azure Portal

1. Go to Azure Portal
2. Select Communication Services resource
3. Click "Metrics"
4. View SMS sending statistics
5. Check for failures or errors
6. Monitor usage and cost

---

## 💰 Pricing Information

### Azure Communication Services SMS:

- **Free Tier**: 
  - ✅ 100 free SMS per month
  - ✅ Good for testing
  - ✅ Limited to 1 phone number

- **Pay-as-you-go**: 
  - ~$0.0075 per SMS
  - No monthly fees
  - Scale as needed
  - Inbound SMS extra

- **Example Cost**:
  - 1 emergency with 3 contacts = 3 SMS
  - Cost: ~$0.023
  - Very affordable for emergencies

### Cost Optimization:
- Use free tier for development
- Pay-as-you-go for production
- Set up billing alerts
- Monitor usage regularly

---

## 🔐 Security Best Practices

### 1. Protect Credentials

```bash
# ✅ DO: Use environment variables
export AZURE_CONNECTION_STRING="endpoint=..."

# ❌ DON'T: Hardcode in code
const conn = "endpoint=..."; // BAD!

# ✅ DO: Use .env file (don't commit)
# Add to .gitignore:
.env
.env.local
```

### 2. Validate Phone Numbers

```javascript
// ✅ Good: Validate E.164 format
function isValidE164(phone) {
  return /^\+\d{1,15}$/.test(phone);
}

// ✅ Good: Sanitize input
phoneNumber = phoneNumber.replace(/\D/g, '');
phoneNumber = '+' + phoneNumber;
```

### 3. Error Handling

```javascript
// ✅ Good: Don't expose sensitive data
catch (error) {
  console.error('SMS error:', error.code); // OK
  // DON'T: console.error('Full error:', error); // Shows credentials!
}
```

### 4. Rate Limiting

```javascript
// Consider: Prevent abuse
// - Rate limit emergency alerts per user/IP
// - Log all SMS attempts
// - Monitor for suspicious patterns
```

---

## 📋 Configuration Checklist

### For Demo Mode:
- [x] Backend installed
- [x] Dependencies installed
- [x] Database initialized
- [x] Contacts added
- [x] Backend running
- [x] Frontend running
- [x] Able to test

### For Real SMS:
- [ ] Azure account created
- [ ] Communication Services resource created
- [ ] Connection string obtained
- [ ] SMS phone number provisioned
- [ ] `.env` file configured
- [ ] Packages installed
- [ ] Backend restarted
- [ ] Test SMS received
- [ ] Billing alerts set up
- [ ] Phone numbers validated

---

## 🎓 Complete Testing Walkthrough

### Time Required: 20 minutes

### Steps:

**1. Setup (5 min)**
```bash
cd backend
npm install
```

**2. Start Backend (2 min)**
```bash
node server.js
# Verify: "running on http://localhost:5000"
```

**3. Start Frontend (3 min)**
```bash
cd frontend
npm start
# App opens at http://localhost:3000
```

**4. Add Contact (2 min)**
- Contacts tab
- Add: +91 9353904659, Dad
- Click Add Contact

**5. Test Alarm (2 min)**
- Play Alarm button
- Listen for siren sound
- Stop Alarm button

**6. Test Location (2 min)**
- Grant geolocation permission
- Verify location shows

**7. Test Emergency (4 min)**
- Say "HELP" or manually trigger
- Verify alarm plays
- Check backend console
- See SMS log in demo mode

### Expected Results:
- ✅ Alarm plays siren sound
- ✅ Location detected
- ✅ Alert sent
- ✅ SMS logged in console
- ✅ History recorded
- ✅ Status updated

---

## 📞 Getting Help

### Azure Documentation:
- https://docs.microsoft.com/en-us/azure/communication-services/

### SMS Specific:
- https://docs.microsoft.com/en-us/azure/communication-services/concepts/sms/concepts

### Contact Support:
- Azure Support Portal
- GitHub Issues
- Email support

---

## 🎉 You're Ready!

Your Help Alarm system now has:
- ✅ SMS integration capability
- ✅ Demo mode for testing
- ✅ Real SMS for production
- ✅ Complete documentation
- ✅ Error handling
- ✅ Security best practices

**Next Step**: Start testing with demo mode, then configure Azure for real SMS!

---

**Last Updated**: 2026-06-11  
**Version**: 2.0.0  
**Status**: Ready for Production
