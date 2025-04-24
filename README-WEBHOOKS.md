# Setting Up User Synchronization with Clerk Webhooks

This application synchronizes user data between Clerk and our database using webhooks. When a user signs up or updates their profile in Clerk, we automatically create or update their profile in our database.

## Setup Instructions

### 1. Configure Clerk Webhook Endpoint

1. Log in to your [Clerk Dashboard](https://dashboard.clerk.dev)
2. Navigate to the **Webhooks** section in the left sidebar
3. Click **Add Endpoint**
4. Enter your webhook URL: `https://your-domain.com/api/webhooks/clerk`
5. Select the following events:
   - `user.created`
   - `user.updated`
   - `user.deleted`
6. Save the endpoint
7. Clerk will generate a **Signing Secret** - copy this value

### 2. Set Environment Variables

Add the following environment variable to your `.env.local` file:

```
CLERK_WEBHOOK_SECRET=your_signing_secret_here
```

### 3. Test the Webhook

You can test the webhook by:

1. Creating a new user in your application
2. Updating a user's profile
3. Check your application logs to verify that the webhook is being received and processed correctly

## Troubleshooting

If your webhook isn't working as expected:

1. Verify that your webhook URL is accessible from the internet
2. Check your application logs for any errors
3. Verify that the `CLERK_WEBHOOK_SECRET` is set correctly
4. In the Clerk Dashboard, you can view recent webhook deliveries and retry failed attempts

## Local Development

For local development, you can use a tool like [ngrok](https://ngrok.com/) to create a temporary public URL that forwards to your local server:

```bash
# Start your Next.js application
npm run dev

# In another terminal, start ngrok on the same port
ngrok http 3000
```

Then update your webhook URL in the Clerk Dashboard to use the ngrok URL. 