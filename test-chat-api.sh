#!/bin/bash

echo "🧪 Testing Chat API Endpoints"
echo "=============================="
echo ""

# Get auth cookie first (you need to be logged in)
echo "1️⃣ Testing Conversations API..."
echo ""

curl -s "http://localhost:8000/facebook/chat/conversations?page_id=253335157869306" \
  -H "Accept: application/json" \
  -b cookies.txt \
  | jq '.'

echo ""
echo "2️⃣ Testing Messages API..."
echo ""

curl -s "http://localhost:8000/facebook/chat/1/messages" \
  -H "Accept: application/json" \
  -b cookies.txt \
  | jq '.'

echo ""
echo "3️⃣ Checking Database..."
echo ""

php artisan tinker --execute="
echo 'Conversations: ' . \App\Models\FacebookConversation::count() . PHP_EOL;
echo 'Messages: ' . \App\Models\FacebookMessage::count() . PHP_EOL;
echo 'Pages: ' . \App\Models\FacebookPage::count() . PHP_EOL;
echo '' . PHP_EOL;
echo 'Latest conversation:' . PHP_EOL;
\$conv = \App\Models\FacebookConversation::with('messages')->first();
if (\$conv) {
    echo '  ID: ' . \$conv->id . PHP_EOL;
    echo '  Messages: ' . \$conv->messages->count() . PHP_EOL;
    echo '  Last message: ' . \$conv->last_message . PHP_EOL;
}
"

echo ""
echo "✅ Test complete!"
