# Firebase Firestore Security Rules

Copy and paste these rules in Firebase Console > Firestore Database > Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - users can only read/write their own document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Scouting entries - ALL authenticated users can read ALL entries
    // This enables team collaboration - everyone can see everyone's scouting data
    match /scoutingEntries/{entryId} {
      // Any logged-in user can view any entry
      allow read: if request.auth != null;
      // Only the creator can add entries (userId must match)
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      // Only the original creator can edit or delete their entries
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
  }
}
```

## ⚠️ IMPORTANT: Apply These Rules!

**If users cannot see other people's entries**, you need to update your Firestore rules:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **scouting-app-dfe42**
3. Click **Build > Firestore Database**
4. Click the **Rules** tab
5. **Delete all existing rules** and paste the rules above
6. Click **Publish**

## How Entry Visibility Works:

- ✅ **All authenticated users can READ all entries** - Team collaboration!
- ✅ **Users can only CREATE their own entries** - userId must match
- ✅ **Users can only EDIT/DELETE their own entries** - Protected ownership
- ✅ **Dashboard shows "My Entries" and "All Entries" toggle** - Easy filtering

## Setup Instructions:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Click **Build > Firestore Database** > Create database
4. Choose "Start in production mode"
5. Select a location close to your users
6. Go to **Rules** tab and paste the rules above
7. Click **Publish**

## Enable Authentication:

1. Go to **Build > Authentication**
2. Click **Get started**
3. Go to **Sign-in method** tab
4. Enable **Email/Password**
5. Save

## Get Your Config:

1. Go to **Project Settings** (gear icon)
2. Scroll down to **Your apps**
3. Click the Web icon `</>`
4. Register app with a nickname
5. Copy the `firebaseConfig` object
6. Paste values into `src/config/firebase.ts`
