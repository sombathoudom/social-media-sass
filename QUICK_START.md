# 🚀 Quick Start Guide

## Start Everything (Easy Way)

```bash
./start-dev.sh
```

This starts:
- ✅ Reverb Server (port 8080)
- ✅ Laravel Server (port 8000)
- ✅ Queue Worker
- ✅ Vite Dev Server (port 5173)

## Stop Everything

```bash
./stop-dev.sh
```

## Manual Start (If you prefer separate terminals)

### Terminal 1: Reverb
```bash
php artisan reverb:start
```

### Terminal 2: Laravel
```bash
php artisan serve
```

### Terminal 3: Queue Worker
```bash
php artisan queue:work
```

### Terminal 4: Vite
```bash
npm run dev
```

## Test Your Setup

1. **Open your app**: http://localhost:8000
2. **Go to chat**: http://localhost:8000/facebook/chat
3. **Send a message from Facebook** to your page
4. **Watch it appear instantly** in your chat interface!

## Check if Reverb is Running

```bash
lsof -i :8080
```

If you see output, Reverb is running!

## View Logs

```bash
# All logs
tail -f storage/logs/laravel.log

# Just broadcasts
tail -f storage/logs/laravel.log | grep "Broadcast"

# Reverb logs (if using start-dev.sh)
tail -f storage/logs/reverb.log
```

## Troubleshooting

### Port 8080 already in use?

```bash
# Find what's using it
lsof -i :8080

# Kill it
kill -9 $(lsof -ti:8080)

# Start Reverb again
php artisan reverb:start
```

### Messages not appearing in real-time?

1. Check Reverb is running: `lsof -i :8080`
2. Check browser console (F12) for errors
3. Check Laravel logs: `tail -f storage/logs/laravel.log`
4. Restart Reverb: `php artisan reverb:restart`

### "Connection refused" in browser?

- Make sure Reverb is running
- Check `.env` has correct settings:
  ```
  REVERB_HOST=127.0.0.1
  REVERB_PORT=8080
  ```
- Restart Vite: `npm run dev`

## That's It! 🎉

Your real-time chat is ready. Just keep the services running and enjoy instant messaging!
