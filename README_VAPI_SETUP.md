# Vapi API Integration Setup Guide

This guide provides complete instructions for setting up the Vapi API integration with Supabase.

## 🔐 Security Setup

### 1. Store VAPI_API_KEY in Supabase Secrets

**Important**: Never expose your Vapi API key in frontend code. Store it securely using Supabase secrets.

#### Option A: Using Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to Settings → API
3. Scroll down to "Project API keys"
4. In the "Secrets" section, add:
   - Key: `VAPI_API_KEY`
   - Value: Your Vapi private API key

#### Option B: Using Supabase CLI
```bash
# Set the secret using CLI
supabase secrets set VAPI_API_KEY=your_vapi_private_key_here
```

### 2. Verify Environment Variables
Ensure these environment variables are available in your Edge Functions:
- `VAPI_API_KEY` - Your Vapi private API key
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (for admin operations)

## 📊 Database Setup

### 1. Run Migration
The migration file `update_users_meta_for_vapi.sql` adds the necessary columns to your existing `users_meta` table:

```sql
-- Adds these columns:
- assistant_id (text) - Stores the Vapi assistant ID
- assistant_created_at (timestamptz) - Timestamp when assistant was created
```

### 2. Verify Table Structure
After running the migration, your `users_meta` table should include:
```sql
CREATE TABLE users_meta (
  id uuid PRIMARY KEY,
  clinic_name text,
  phone_number text,
  clinic_connected boolean DEFAULT false,
  plan text,
  assistant_active boolean DEFAULT false,
  assistant_id text,                    -- NEW
  assistant_created_at timestamptz,     -- NEW
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

## 🚀 Deployment

### 1. Deploy Edge Functions
```bash
# Deploy the create-assistant function
supabase functions deploy create-assistant

# Verify deployment
supabase functions list
```

### 2. Test the Integration
Use the provided React component `CreateAssistantButton` to test the integration:

1. User must be authenticated
2. User must have an active plan
3. Click "Create My Assistant" button
4. Verify assistant is created in both Vapi and your database

## 🧪 Testing Scenarios

### Success Cases
- ✅ Authenticated user with valid business name and timezone
- ✅ Assistant created successfully in Vapi
- ✅ Assistant ID saved to database
- ✅ Success message displayed to user

### Error Handling Cases
- ❌ **Unauthenticated user**: Returns 401 error
- ❌ **Missing parameters**: Returns 400 error with validation message
- ❌ **Duplicate assistant**: Returns 409 error
- ❌ **Vapi API failure**: Returns 500 error, attempts cleanup
- ❌ **Database failure**: Returns 500 error, cleans up Vapi assistant
- ❌ **Rate limiting**: Returns 429 error with retry message

### Test Commands
```bash
# Test with curl (replace with your values)
curl -X POST \
  'https://your-project.supabase.co/functions/v1/create-assistant' \
  -H 'Authorization: Bearer YOUR_SESSION_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "userId": "user-uuid-here",
    "businessName": "Test Business",
    "timezone": "America/New_York"
  }'
```

## 🔍 Monitoring & Debugging

### 1. Check Edge Function Logs
```bash
# View function logs
supabase functions logs create-assistant

# Follow logs in real-time
supabase functions logs create-assistant --follow
```

### 2. Database Queries for Debugging
```sql
-- Check if assistant was created for a user
SELECT id, assistant_id, assistant_created_at 
FROM users_meta 
WHERE id = 'user-uuid-here';

-- Count total assistants created
SELECT COUNT(*) as total_assistants 
FROM users_meta 
WHERE assistant_id IS NOT NULL;
```

### 3. Common Issues & Solutions

#### Issue: "VAPI_API_KEY not found"
**Solution**: Ensure the secret is properly set in Supabase
```bash
supabase secrets list  # Verify secret exists
supabase secrets set VAPI_API_KEY=your_key_here
```

#### Issue: "Authentication failed"
**Solution**: Check that the user session token is valid
- Verify user is logged in
- Check token expiration
- Ensure proper Authorization header format

#### Issue: "Assistant already exists"
**Solution**: Check database for existing assistant
```sql
SELECT * FROM users_meta WHERE id = 'user-id' AND assistant_id IS NOT NULL;
```

## 🛡️ Security Best Practices

### 1. API Key Security
- ✅ Store VAPI_API_KEY as Supabase secret
- ✅ Never expose in frontend code
- ✅ Use environment variables in Edge Functions
- ❌ Never commit API keys to version control

### 2. Authentication
- ✅ Verify user authentication on every request
- ✅ Validate user can only create assistant for themselves
- ✅ Use Supabase RLS policies for database access

### 3. Input Validation
- ✅ Validate all required parameters
- ✅ Sanitize business name input
- ✅ Validate timezone format
- ✅ Check for duplicate assistants

### 4. Error Handling
- ✅ Don't expose internal errors to frontend
- ✅ Log detailed errors server-side
- ✅ Provide user-friendly error messages
- ✅ Implement proper cleanup on failures

## 📱 Frontend Integration

### Using the CreateAssistantButton Component
```tsx
import CreateAssistantButton from '../components/CreateAssistantButton';

function MyPage() {
  const handleAssistantCreated = (assistantId: string) => {
    console.log('Assistant created:', assistantId);
    // Refresh UI, show success message, etc.
  };

  return (
    <CreateAssistantButton 
      onAssistantCreated={handleAssistantCreated}
      businessName="My Business"
      timezone="America/New_York"
    />
  );
}
```

### Using the useAssistantStatus Hook
```tsx
import { useAssistantStatus } from '../hooks/useAssistantStatus';

function AssistantStatus() {
  const { hasAssistant, assistantId, isLoading, refreshStatus } = useAssistantStatus();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {hasAssistant ? (
        <p>✅ Assistant created: {assistantId}</p>
      ) : (
        <p>❌ No assistant found</p>
      )}
      <button onClick={refreshStatus}>Refresh</button>
    </div>
  );
}
```

## 🔄 Maintenance

### Regular Checks
1. Monitor Edge Function performance and error rates
2. Check database for orphaned records
3. Verify Vapi API key validity
4. Review user feedback and error reports

### Updates
1. Keep Supabase client libraries updated
2. Monitor Vapi API changes and updates
3. Update TypeScript interfaces as needed
4. Test integration after any major updates

---

## 📞 Support

If you encounter issues:
1. Check the Edge Function logs first
2. Verify all environment variables are set
3. Test with a simple curl request
4. Check database state for the affected user
5. Review this documentation for common solutions