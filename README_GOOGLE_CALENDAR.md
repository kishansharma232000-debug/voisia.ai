# Google Calendar Integration Setup Guide

This guide provides complete instructions for setting up Google Calendar integration with automatic token management and OAuth flow.

## 🔐 Environment Variables Setup

### Required Environment Variables

Add these to your Supabase project settings (Project Settings → API → Environment Variables):

```bash
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Supabase Configuration (should already exist)
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Getting Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google Calendar API:
   - Go to "APIs & Services" → "Library"
   - Search for "Google Calendar API"
   - Click "Enable"
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - `https://your-project.supabase.co/auth/v1/callback`
     - `http://localhost:5173/google-calendar` (for development)

## 📊 Database Setup

### 1. Run Migration
Execute the migration file `create_google_tokens_table.sql`:

```sql
-- Creates google_tokens table with:
- id (uuid, primary key)
- user_id (uuid, foreign key to auth.users)
- access_token (text, encrypted)
- refresh_token (text, encrypted)
- expiry_date (timestamptz, token expiration)
- created_at/updated_at (timestamps)
```

### 2. Verify Table Structure
After running the migration, your `google_tokens` table should include proper RLS policies and indexes.

## 🚀 Supabase Configuration

### 1. Enable Google OAuth Provider
In your Supabase dashboard:
1. Go to Authentication → Providers
2. Enable Google provider
3. Add your Google Client ID and Client Secret
4. Set redirect URL to your domain

### 2. Deploy Edge Function
```bash
# Deploy the calendar function
supabase functions deploy calendar

# Verify deployment
supabase functions list
```

## 🧪 Testing the Integration

### Frontend Testing
1. Navigate to `/google-calendar` page
2. Click "Connect Google Calendar" button
3. Complete OAuth flow
4. Click "Test Calendar Integration" to fetch availability
5. Verify available time slots are displayed

### API Testing
```bash
# Test availability endpoint
curl -X GET \
  'https://your-project.supabase.co/functions/v1/calendar/availability' \
  -H 'Authorization: Bearer YOUR_SESSION_TOKEN'

# Test booking endpoint
curl -X POST \
  'https://your-project.supabase.co/functions/v1/calendar/book' \
  -H 'Authorization: Bearer YOUR_SESSION_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "date": "2025-01-15",
    "time": "14:00",
    "duration": 60,
    "title": "Test Appointment",
    "description": "Test booking via API"
  }'
```

## 🔍 Monitoring & Debugging

### 1. Check Edge Function Logs
```bash
# View function logs
supabase functions logs calendar

# Follow logs in real-time
supabase functions logs calendar --follow
```

### 2. Database Queries for Debugging
```sql
-- Check stored tokens for a user
SELECT id, user_id, expiry_date, created_at, updated_at 
FROM google_tokens 
WHERE user_id = 'user-uuid-here';

-- Count total connected users
SELECT COUNT(*) as connected_users 
FROM google_tokens 
WHERE expiry_date > now();
```

### 3. Common Issues & Solutions

#### Issue: "Google Calendar not connected"
**Solution**: Check if tokens exist and are not expired
```sql
SELECT * FROM google_tokens WHERE user_id = 'user-id' AND expiry_date > now();
```

#### Issue: "Token refresh failed"
**Solution**: User needs to re-authenticate
- Delete existing tokens: `DELETE FROM google_tokens WHERE user_id = 'user-id';`
- Have user reconnect via OAuth flow

#### Issue: "Failed to fetch availability"
**Solution**: Check Google Calendar API quotas and permissions
- Verify Calendar API is enabled in Google Cloud Console
- Check API quotas haven't been exceeded
- Ensure proper scopes are requested during OAuth

## 🛡️ Security Best Practices

### 1. Token Security
- ✅ Tokens stored server-side only
- ✅ Automatic token refresh implemented
- ✅ RLS policies protect user data
- ✅ No tokens exposed to frontend

### 2. API Security
- ✅ User authentication required for all endpoints
- ✅ Input validation on all parameters
- ✅ Rate limiting considerations
- ✅ Error handling without exposing internals

### 3. OAuth Security
- ✅ PKCE flow for additional security
- ✅ State parameter validation
- ✅ Secure redirect URI validation
- ✅ Scope limitation to required permissions

## 📱 Frontend Integration

### Using the useGoogleCalendar Hook
```tsx
import { useGoogleCalendar } from '../hooks/useGoogleCalendar';

function CalendarComponent() {
  const {
    isConnected,
    isConnecting,
    availability,
    connectCalendar,
    fetchAvailability,
    bookEvent,
  } = useGoogleCalendar();

  const handleConnect = () => {
    connectCalendar();
  };

  const handleBooking = async () => {
    const result = await bookEvent({
      date: '2025-01-15',
      time: '14:00',
      duration: 60,
      title: 'Test Appointment',
    });
    
    if (result.success) {
      console.log('Event booked:', result.event);
    }
  };

  return (
    <div>
      {isConnected ? (
        <button onClick={fetchAvailability}>
          Check Availability
        </button>
      ) : (
        <button onClick={handleConnect} disabled={isConnecting}>
          {isConnecting ? 'Connecting...' : 'Connect Calendar'}
        </button>
      )}
    </div>
  );
}
```

## 🔄 Maintenance

### Regular Checks
1. Monitor token refresh success rates
2. Check Edge Function performance and error rates
3. Verify Google Calendar API quota usage
4. Review user feedback and error reports

### Updates
1. Keep Google Calendar API client libraries updated
2. Monitor Google Calendar API changes and deprecations
3. Update TypeScript interfaces as needed
4. Test integration after any major updates

---

## 📞 Support

If you encounter issues:
1. Check the Edge Function logs first
2. Verify all environment variables are set correctly
3. Test with a simple API call using curl
4. Check database state for the affected user
5. Review this documentation for common solutions

The integration is now production-ready with comprehensive security, error handling, and user experience features!