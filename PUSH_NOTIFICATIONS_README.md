# Push Notifications Setup

## What's Already Done (Mobile Side)

The mobile app is fully configured for push notifications. It will automatically:
- Request notification permissions on first launch
- Generate FCM tokens for each device
- Send tokens to the backend when users log in
- Update tokens if they change
- Clear tokens on logout

## What You Need to Do (Backend)

### 1. Get Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use existing)
3. Add your Android app:
   - Package name: `com.capsule`
   - Download `google-services.json`
4. Go to Project Settings → Service Accounts
5. Click "Generate new private key"
6. Save the JSON file somewhere secure on your server

### 2. Install Firebase Admin SDK

```bash
npm install firebase-admin
```

### 3. Initialize Firebase (One Time)

Create a file to initialize Firebase:

```javascript
// firebase.js or wherever you keep configs
const admin = require('firebase-admin');
const serviceAccount = require('./path-to-your-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports = admin;
```

### 4. Create API Endpoint

The mobile app will POST to this endpoint automatically:

**Endpoint:** `POST /api/notifications/register-token`

**Headers:**
- `Authorization: Bearer {user_token}`
- `Content-Type: application/json`

**Request Body:**
```json
{
  "token": "fcm_device_token_here",
  "platform": "android",
  "deviceInfo": {
    "os": "android",
    "version": "13"
  }
}
```

**Example Implementation:**

```javascript
// Your route file
app.post('/api/notifications/register-token', authenticateUser, async (req, res) => {
  try {
    const { token, platform, deviceInfo } = req.body;
    const userId = req.user.id; // or however you get user from auth

    // Save to database (create table if needed)
    await db.query(`
      INSERT INTO user_fcm_tokens (user_id, token, platform, device_info, updated_at)
      VALUES ($1, $2, $3, $4, NOW())
      ON CONFLICT (token)
      DO UPDATE SET
        user_id = $1,
        platform = $2,
        device_info = $3,
        updated_at = NOW()
    `, [userId, token, platform, JSON.stringify(deviceInfo)]);

    res.json({ success: true });
  } catch (error) {
    console.error('Error saving FCM token:', error);
    res.status(500).json({ error: 'Failed to register token' });
  }
});
```

### 5. Database Table

You'll need a table to store tokens:

```sql
CREATE TABLE user_fcm_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  token TEXT NOT NULL UNIQUE,
  platform VARCHAR(10) NOT NULL,
  device_info JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_fcm_tokens_user_id ON user_fcm_tokens(user_id);
```

### 6. Send Notifications

When you want to send a notification:

```javascript
const admin = require('./firebase');

async function sendNotification(userId, title, message, data = {}) {
  try {
    // Get user's FCM tokens from database
    const result = await db.query(
      'SELECT token FROM user_fcm_tokens WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      console.log('No FCM tokens found for user');
      return;
    }

    // Send to all user's devices
    const tokens = result.rows.map(row => row.token);

    const response = await admin.messaging().sendEachForMulticast({
      tokens,
      notification: {
        title,
        body: message,
      },
      data, // optional custom data
    });

    console.log(`Sent ${response.successCount} notifications`);
    return response;
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}
```

### 7. Usage Examples

```javascript
// Send when someone likes a post
await sendNotification(
  postOwnerId,
  'New Like',
  'Someone liked your post!',
  { type: 'like', postId: '123' }
);

// Send event reminder
await sendNotification(
  userId,
  'Event Starting Soon',
  'Your event starts in 1 hour',
  { type: 'event_reminder', eventId: '456' }
);

// Send to multiple users
const attendees = [1, 2, 3, 4];
for (const userId of attendees) {
  await sendNotification(
    userId,
    'Event Updated',
    'The event location has changed'
  );
}
```

## Important Notes

- **Security:** Never commit the Firebase service account JSON to git
- **Token Lifecycle:** Tokens can change or expire, the app handles updates automatically
- **Multiple Devices:** One user can have multiple tokens (phone + tablet)
- **iOS:** Will need additional setup on Mac later, but the backend code works for both platforms

## Testing

1. Mobile app will send token when user logs in
2. Check your database to see if token was saved
3. Use the token to send a test notification:

```javascript
await admin.messaging().send({
  token: 'token_from_database',
  notification: {
    title: 'Test',
    body: 'It works!'
  }
});
```

## Files Modified on Mobile

- `App.tsx` - Added auto-sync on login/token refresh
- `shared/services/fcmTokenSync.ts` - Service that POSTs tokens to your API
- `shared/services/notificationService.ts` - Handles FCM setup
- Settings screen - Shows token for debugging

That's it! The mobile app handles everything automatically. You just need to create the endpoint and start sending notifications.
