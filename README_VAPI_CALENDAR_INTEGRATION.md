# Vapi + Google Calendar Integration Guide

This guide provides complete setup instructions for integrating Vapi AI assistants with Google Calendar for real-time appointment booking.

## 🔐 Environment Variables Setup

### Required Environment Variables in Supabase

Add these to your Supabase project settings (Project Settings → API → Environment Variables):

```bash
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Vapi API Configuration
VAPI_API_KEY=your_vapi_private_api_key_here

# Supabase Configuration (should already exist)
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 🔑 Getting Google OAuth Credentials

1. **Go to Google Cloud Console**: [https://console.cloud.google.com/](https://console.cloud.google.com/)
2. **Create or select a project**
3. **Enable Google Calendar API**:
   - Navigate to "APIs & Services" → "Library"
   - Search for "Google Calendar API"
   - Click "Enable"
4. **Create OAuth 2.0 Credentials**:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - `https://your-project.supabase.co/auth/v1/callback`
     - `http://localhost:5173/google-calendar` (for development)
5. **Copy your Client ID and Client Secret**

## 📊 Database Setup

### 1. Run Migrations
Execute these migration files in order:
- `create_google_tokens_table.sql` - Creates the tokens storage table
- `update_users_meta_for_google.sql` - Adds Google connection tracking

### 2. Verify Database Structure
Your database should now have:
- `google_tokens` table with proper RLS policies
- Updated `users_meta` table with Google connection fields
- Proper indexes for performance

## 🚀 Supabase Configuration

### 1. Enable Google OAuth Provider
In your Supabase dashboard:
1. Go to Authentication → Providers
2. Enable Google provider
3. Add your Google Client ID and Client Secret
4. Set redirect URL to your domain

### 2. Deploy Edge Functions
```bash
# Deploy the calendar functions
supabase functions deploy vapi-calendar-functions

# Deploy the webhook handler
supabase functions deploy vapi-webhook

# Verify deployments
supabase functions list
```

## 🎯 How It Works

### 1. Assistant Creation with Calendar Integration
When you create a Vapi assistant through the app:
- The assistant is configured with calendar function capabilities
- Two functions are added: `get_availability` and `book_appointment`
- The assistant receives instructions on how to handle appointment booking

### 2. Calendar Function Flow
```
Caller → Vapi Assistant → Webhook → Supabase Edge Function → Google Calendar API
```

1. **Caller requests appointment**: "I'd like to book a cleaning"
2. **Assistant gets details**: Name, phone, appointment type
3. **Assistant calls get_availability**: Checks real-time calendar
4. **Assistant presents options**: "I have Tuesday at 2 PM or Wednesday at 10 AM"
5. **Caller chooses time**: "Tuesday at 2 PM works"
6. **Assistant calls book_appointment**: Creates calendar event and database record
7. **Confirmation**: "Perfect! Your appointment is booked for Tuesday at 2 PM"

### 3. Real-time Integration
- **Availability checking**: Assistant checks Google Calendar in real-time
- **Conflict prevention**: Double-checks availability before booking
- **Automatic sync**: Appointments appear immediately in Google Calendar
- **Database tracking**: All bookings are stored in your Supabase database

## 🧪 Testing the Integration

### 1. Frontend Testing
1. Navigate to `/google-calendar` page
2. Click "Connect Google Calendar" button
3. Complete OAuth flow
4. Create a Vapi assistant with calendar integration
5. Test the assistant by calling the Vapi number

### 2. Function Testing
Test the calendar functions directly:

```bash
# Test availability function
curl -X POST \
  'https://your-project.supabase.co/functions/v1/vapi-calendar-functions' \
  -H 'Content-Type: application/json' \
  -d '{
    "function_name": "get_availability",
    "parameters": {
      "user_id": "your-user-id-here"
    }
  }'

# Test booking function
curl -X POST \
  'https://your-project.supabase.co/functions/v1/vapi-calendar-functions' \
  -H 'Content-Type: application/json' \
  -d '{
    "function_name": "book_appointment",
    "parameters": {
      "user_id": "your-user-id-here",
      "date": "2025-01-15",
      "time": "14:00",
      "duration": 60,
      "title": "Dental Cleaning",
      "caller_name": "John Doe",
      "caller_number": "+1234567890"
    }
  }'
```

## 🔍 Monitoring & Debugging

### 1. Check Edge Function Logs
```bash
# View calendar function logs
supabase functions logs vapi-calendar-functions

# View webhook logs
supabase functions logs vapi-webhook

# Follow logs in real-time
supabase functions logs vapi-calendar-functions --follow
```

### 2. Database Queries for Debugging
```sql
-- Check Google tokens for a user
SELECT id, user_id, expiry_date, created_at 
FROM google_tokens 
WHERE user_id = 'user-uuid-here';

-- Check appointments created
SELECT * FROM appointments 
WHERE user_id = 'user-uuid-here' 
ORDER BY created_at DESC;

-- Check assistant configuration
SELECT * FROM assistants 
WHERE user_id = 'user-uuid-here';
```

### 3. Common Issues & Solutions

#### Issue: "Calendar not connected"
**Solution**: User needs to connect Google Calendar
- Check if tokens exist: `SELECT * FROM google_tokens WHERE user_id = 'user-id';`
- If no tokens, user must complete OAuth flow
- If tokens expired, they'll be auto-refreshed

#### Issue: "Function call failed"
**Solution**: Check Vapi webhook configuration
- Verify webhook URL is set correctly in Vapi dashboard
- Check Edge Function logs for errors
- Ensure all environment variables are set

#### Issue: "Booking failed"
**Solution**: Check calendar permissions and conflicts
- Verify Google Calendar API is enabled
- Check for calendar conflicts
- Ensure proper OAuth scopes are granted

## 🛡️ Security Features

### 1. Token Management
- ✅ Automatic token refresh before expiration
- ✅ Secure server-side token storage
- ✅ No tokens exposed to frontend
- ✅ RLS policies protect user data

### 2. Function Security
- ✅ User authentication required
- ✅ Input validation and sanitization
- ✅ Error handling without exposing internals
- ✅ Proper cleanup on failures

### 3. Calendar Security
- ✅ Limited OAuth scopes (calendar events only)
- ✅ User consent required for calendar access
- ✅ Secure API communication
- ✅ No personal data exposure

## 📱 User Experience Flow

### 1. Setup Process
1. User signs up and creates account
2. User connects Google Calendar (OAuth flow)
3. User creates Vapi assistant with calendar integration
4. User connects phone number to Vapi assistant
5. System is ready for live calls

### 2. Call Handling
1. **Caller dials clinic number**
2. **Vapi assistant answers**: "Hello, thank you for calling [Business Name]"
3. **Assistant identifies need**: "How can I help you today?"
4. **For appointments**: Assistant collects name, phone, appointment type
5. **Checks availability**: Real-time calendar lookup
6. **Presents options**: Clear time slot options
7. **Books appointment**: Creates calendar event and database record
8. **Confirms booking**: Provides confirmation details

### 3. Post-Booking
- Appointment appears in Google Calendar immediately
- Database record created for tracking
- Optional: Email confirmation sent to patient
- Staff can see booking in dashboard

## 🔄 Maintenance

### Regular Checks
1. Monitor Edge Function performance and error rates
2. Check Google Calendar API quota usage
3. Verify token refresh success rates
4. Review appointment booking success rates

### Updates
1. Keep Google Calendar API client libraries updated
2. Monitor Vapi API changes and updates
3. Update assistant instructions as needed
4. Test integration after major updates

---

## 📞 Support

If you encounter issues:
1. Check Edge Function logs first
2. Verify all environment variables are set
3. Test calendar connection in the dashboard
4. Check database state for affected users
5. Review this documentation for solutions

The integration is now production-ready with comprehensive error handling, security features, and user experience optimization!