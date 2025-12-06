# 🎨 Testing Media Upload (Images, Voice, Video)

## ✅ What I Fixed

1. **File Upload Handling**: Added support for `image`, `audio`, `video`, and `file` uploads
2. **Storage Setup**: Created storage directories and linked public storage
3. **URL Generation**: Using `url()` helper to generate full URLs (works with ngrok)
4. **Better Logging**: Added detailed logs to debug Facebook API issues
5. **Authorization**: Added checks to ensure users can only send to their conversations

## 📁 Storage Structure

Files are stored in:
```
storage/app/public/chat/
├── images/    (jpg, jpeg, png, gif - max 10MB)
├── audio/     (mp3, wav, ogg, m4a - max 10MB)
├── videos/    (mp4, mov, avi - max 25MB)
└── files/     (any file - max 25MB)
```

Public access via: `https://your-ngrok-url.ngrok-free.app/storage/chat/...`

## 🧪 How to Test

### Test 1: Send Text Message
1. Open chat: `http://localhost:8000/facebook/chat`
2. Select conversation
3. Type "Hello" and send
4. Should work ✅

### Test 2: Send Image
1. Click the image icon
2. Select an image (jpg, png, gif)
3. Preview should show
4. Click send
5. Check logs: `tail -f storage/logs/laravel.log`

### Test 3: Send Voice
1. Click the microphone icon
2. Record audio or select audio file
3. Send
4. Check logs for any errors

### Test 4: Check Facebook Response
After sending, check logs for:
```
Sending message to Facebook
Message sent to Facebook successfully
```

## 🔍 Debugging

### Check if File Was Uploaded

```bash
ls -lh storage/app/public/chat/images/
ls -lh storage/app/public/chat/audio/
```

### Check if URL is Accessible

After uploading, check the logs for the URL, then test:
```bash
curl -I https://your-ngrok-url.ngrok-free.app/storage/chat/images/filename.jpg
```

Should return `200 OK`

### Check Laravel Logs

```bash
tail -f storage/logs/laravel.log | grep -A 10 "Sending message"
```

Look for:
- ✅ "Sending message to Facebook"
- ✅ "Message sent to Facebook successfully"
- ❌ "Facebook API Error"

## 🐛 Common Issues

### Issue 1: "File not found" or 404 on image URL

**Solution:**
```bash
# Make sure storage is linked
php artisan storage:link

# Check permissions
chmod -R 775 storage/app/public/chat
```

### Issue 2: Facebook can't access the file

**Problem**: Facebook needs to download the file from your server

**Solution**: Make sure:
1. Ngrok is running and forwarding to your Laravel app
2. The URL in logs shows your ngrok domain
3. The file is publicly accessible

Test:
```bash
# From another computer or use curl
curl https://your-ngrok-url.ngrok-free.app/storage/chat/images/test.jpg
```

### Issue 3: "Invalid attachment URL"

**Possible causes:**
- URL is not publicly accessible
- File is too large
- Wrong file type

**Check logs for:**
```
Facebook API Error (100): Invalid attachment URL
```

### Issue 4: Voice recording not working

**Frontend issue** - Check browser console for:
- Microphone permissions
- MediaRecorder API support

## 📊 Expected Flow

### For Images:
1. User selects image in frontend
2. Frontend sends FormData with `image` file
3. Backend saves to `storage/app/public/chat/images/`
4. Backend generates public URL
5. Backend sends to Facebook API with attachment
6. Facebook downloads the image from your server
7. Facebook sends image to user
8. Message saved to DB
9. Broadcast to frontend

### For Voice:
1. User records audio in frontend
2. Frontend converts to file (blob)
3. Frontend sends FormData with `audio` file
4. Backend saves to `storage/app/public/chat/audio/`
5. Same flow as images...

## 🔧 Manual Test

Test the endpoint directly:

```bash
# Create a test image
curl -X POST http://localhost:8000/facebook/chat/1/send \
  -H "Content-Type: multipart/form-data" \
  -F "image=@/path/to/test.jpg" \
  -F "attachment_type=image" \
  -b cookies.txt
```

## 📝 Validation Rules

Current validation:
- **Images**: jpg, jpeg, png, gif - max 10MB
- **Audio**: mp3, wav, ogg, m4a - max 10MB
- **Video**: mp4, mov, avi - max 25MB
- **Files**: any type - max 25MB

To change limits, edit `app/Http/Controllers/Facebook/ChatController.php`:
```php
'image' => ['nullable', 'file', 'mimes:jpg,jpeg,png,gif', 'max:10240'],
```

## ✨ What Should Work Now

- ✅ Text messages
- ✅ Image uploads (single)
- ✅ Voice/audio uploads
- ✅ Video uploads
- ✅ File uploads
- ✅ Real-time broadcasting
- ✅ Message history

## 🚨 Important Notes

1. **Ngrok Required**: For Facebook to access uploaded files, you need ngrok running
2. **File Size**: Facebook has limits on attachment sizes
3. **File Types**: Only specific types are supported by Facebook Messenger
4. **Public Access**: Files must be publicly accessible (no authentication required)

## 🎯 Next Steps

1. Try sending an image
2. Check the logs
3. If it fails, share the error message
4. Check if the file URL is accessible from outside

Let me know what error you get and I'll help fix it! 🚀
