# Laravel Reverb Setup Guide

## ✅ What's Already Configured

Your Laravel Reverb is already installed and configured! Here's what's in place:

### Backend Configuration
- ✅ Reverb package installed
- ✅ `.env` configured with Reverb settings
- ✅ Broadcasting driver set to `reverb`
- ✅ `MessageSent` event configured to broadcast
- ✅ Webhook handler broadcasts messages

### Frontend Configuration
- ✅ `laravel-echo` and `pusher-js` installed
- ✅ Echo configured in `resources/js/bootstrap.ts`
- ✅ Bootstrap imported in `resources/js/app.tsx`
- ✅ Chat components using `window.Echo`

## 🚀 How to Start Reverb

### Step 1: Start the Reverb Server

Open a new terminal and run:

```bash
php artisan reverb:start
```

You should see output like:
```
INFO  Server running on http://127.0.0.1:8080
INFO  Listening for connections...
```

**Keep this terminal running!** Reverb needs to stay active for real-time features.

### Step 2: Start Your Laravel App

In another terminal:

```bash
php artisan serve
```

### Step 3: Start the Queue Worker

In another terminal (for processing jobs):

```bash
php artisan queue:work
```

### Step 4: Start Vite (Frontend)

In another terminal:

```bash
npm run dev
```

## 🧪 Testing Real-Time Chat

### Test 1: Send a Message from Facebook

1. Go to your Facebook page
2. Send a message to your page from a personal account
3. Check your Laravel logs: `tail -f storage/logs/laravel.log`
4. You should see the message being processed and broadcast

### Test 2: Send a Message from Chat Interface

1. Open your chat page: `http://localhost:8000/facebook/chat`
2. Select a conversation
3. Send a message
4. The message should appear instantly without page refresh

### Test 3: Check Reverb Connection

Open browser console (F12) and check for:
```
Reverb connected successfully
```

If you see connection errors, check:
- Reverb server is running
- Port 8080 is not blocked
- `.env` settings match

## 📝 Environment Variables

Your current `.env` settings:

```env
BROADCAST_CONNECTION=reverb
BROADCAST_DRIVER=reverb

REVERB_APP_ID=local
REVERB_APP_KEY=local
REVERB_APP_SECRET=local

REVERB_HOST=127.0.0.1
REVERB_PORT=8080
REVERB_SCHEME=http
REVERB_ENCRYPT=false

VITE_REVERB_APP_KEY="${REVERB_APP_KEY}"
VITE_REVERB_HOST="${REVERB_HOST}"
VITE_REVERB_PORT="${REVERB_PORT}"
VITE_REVERB_SCHEME="${REVERB_SCHEME}"
```

## 🔧 Troubleshooting

### Issue: "Connection refused" in browser console

**Solution:**
- Make sure Reverb is running: `php artisan reverb:start`
- Check if port 8080 is available: `lsof -i :8080`

### Issue: Messages not appearing in real-time

**Solution:**
1. Check Reverb logs for errors
2. Verify the event is broadcasting:
   ```php
   // In app/Events/MessageSent.php
   public function broadcastOn()
   {
       return new Channel('chat.' . $this->message->conversation_id);
   }
   ```
3. Check browser console for Echo errors
4. Verify the channel name matches in frontend:
   ```typescript
   window.Echo.channel(`chat.${conversationId}`)
   ```

### Issue: "CORS error" in browser

**Solution:**
Update `config/reverb.php`:
```php
'allowed_origins' => ['*'], // Already set
```

### Issue: Reverb stops after closing terminal

**Solution:**
Use a process manager like `supervisor` or run in background:
```bash
php artisan reverb:start > /dev/null 2>&1 &
```

Or use Laravel Forge/Vapor for production.

## 🎯 Production Setup

For production with Ngrok:

1. Update `.env`:
```env
REVERB_HOST=your-ngrok-url.ngrok-free.app
REVERB_PORT=443
REVERB_SCHEME=https
REVERB_ENCRYPT=true
```

2. Start Reverb with public host:
```bash
php artisan reverb:start --host=0.0.0.0 --port=8080
```

3. Configure Ngrok to forward to port 8080

## 📊 Monitoring

### Check Active Connections

```bash
php artisan reverb:restart
```

### View Logs

```bash
tail -f storage/logs/laravel.log | grep "Broadcast"
```

### Debug Mode

Enable debug in browser console:
```javascript
window.Echo.connector.pusher.connection.bind('state_change', function(states) {
    console.log('Reverb state:', states.current);
});
```

## ✨ Your Chat Flow

1. **User sends message to Facebook page**
   ↓
2. **Facebook webhook → `WebhookHandlerService::handleMessagingEvent()`**
   ↓
3. **Message saved to database**
   ↓
4. **`broadcast(new MessageSent($message))`**
   ↓
5. **Reverb broadcasts to channel `chat.{conversation_id}`**
   ↓
6. **Frontend Echo listener receives message**
   ↓
7. **React component updates UI instantly**

## 🎉 You're All Set!

Your real-time chat is ready to use. Just make sure all 4 processes are running:

1. ✅ Reverb Server (`php artisan reverb:start`)
2. ✅ Laravel App (`php artisan serve`)
3. ✅ Queue Worker (`php artisan queue:work`)
4. ✅ Vite Dev Server (`npm run dev`)

Happy chatting! 🚀
