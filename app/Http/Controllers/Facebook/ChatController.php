<?php

namespace App\Http\Controllers\Facebook;

use Inertia\Inertia;
use App\Models\FacebookPage;
use Illuminate\Http\Request;

use App\Models\FacebookMessage;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;

use App\Models\FacebookConversation;
use App\Services\Facebook\ChatService;
use App\Services\Facebook\ConversationService;

class ChatController extends Controller
{
    public function __construct(
        protected ConversationService $conversationService,
        protected ChatService $chatService
    ) {}

    /**
     * MAIN CHAT PAGE (Inertia)
     */
    public function index(Request $request)
    {
        $conversationId = $request->conversation_id;

        // All pages connected by current user
        $pages = FacebookPage::where('user_id', auth()->id())->get();

        $activeConversation = null;
        $messages = null;

        if ($conversationId) {
            $activeConversation = FacebookConversation::with(['user', 'page'])
                ->find($conversationId);

            if ($activeConversation) {
                // Check if user owns this conversation's page
                if ($activeConversation->page->user_id !== auth()->id()) {
                    abort(403, 'Unauthorized');
                }

                $messages = FacebookMessage::where('conversation_id', $activeConversation->id)
                    ->orderBy('id', 'asc') // Oldest first for chat display
                    ->paginate(25);

                // Reset unread count
                $this->conversationService->markAsRead($activeConversation);
            }
        }

        return Inertia::render('Facebook/Chat/ChatPage', [
            'pages' => $pages,
            'activeConversation' => $activeConversation,
            'messages' => $messages,
            'filters' => [
                'conversation_id' => $conversationId,
                'page_id' => $request->page_id,
                'search' => $request->search,
                'unread' => $request->unread,
            ],
        ]);
    }

    /**
     * LOAD PAGINATED MESSAGES (for infinite scroll)
     */
    public function messages(FacebookConversation $conversation)
    {
        // Check if user owns this conversation's page
        if ($conversation->page->user_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        $messages = FacebookMessage::where('conversation_id', $conversation->id)
            ->orderBy('id', 'asc') // Oldest first for chat display
            ->paginate(25);

        return response()->json($messages);
    }

    /**
     * SEND MESSAGE (text, image, audio)
     */
    public function send(FacebookConversation $conversation, Request $request)
    {
        // Check authorization
        if ($conversation->page->user_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        $validated = $request->validate([
            'text' => ['nullable', 'string'],
            'attachment_type' => ['nullable', 'string'], // image/audio/file/video
            'attachment_url'  => ['nullable', 'string'],
            'image' => ['nullable', 'file', 'mimes:jpg,jpeg,png,gif', 'max:10240'], // 10MB
            'audio' => ['nullable', 'file', 'mimes:mp3,wav,ogg,m4a', 'max:10240'],
            'video' => ['nullable', 'file', 'mimes:mp4,mov,avi', 'max:25600'], // 25MB
            'file' => ['nullable', 'file', 'max:25600'],
        ]);

        $payload = [
            'text' => $validated['text'] ?? null,
            'attachment_type' => $validated['attachment_type'] ?? null,
            'attachment_url' => $validated['attachment_url'] ?? null,
        ];

        // Handle file uploads
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('chat/images', 'public');
            $payload['attachment_type'] = 'image';
            $payload['attachment_url'] = url('storage/' . $path); // Use url() for full URL with ngrok
        } elseif ($request->hasFile('audio')) {
            $path = $request->file('audio')->store('chat/audio', 'public');
            $payload['attachment_type'] = 'audio';
            $payload['attachment_url'] = url('storage/' . $path);
        } elseif ($request->hasFile('video')) {
            $path = $request->file('video')->store('chat/videos', 'public');
            $payload['attachment_type'] = 'video';
            $payload['attachment_url'] = url('storage/' . $path);
        } elseif ($request->hasFile('file')) {
            $path = $request->file('file')->store('chat/files', 'public');
            $payload['attachment_type'] = 'file';
            $payload['attachment_url'] = url('storage/' . $path);
        }

        $message = $this->chatService->sendMessage($conversation, $payload);

        return response()->json([
            'success' => true,
            'message' => $message,
        ]);
    }

    /**
     * Directly open a conversation
     */
    public function show(FacebookConversation $conversation)
    {
        $messages = FacebookMessage::where('conversation_id', $conversation->id)
            ->orderBy('id', 'desc')
            ->paginate(25);

        $this->conversationService->markAsRead($conversation);

        return Inertia::render('Facebook/Chat/ChatPage', [
            'activeConversation' => $conversation->load('user', 'page'),
            'messages' => $messages,
        ]);
    }

    /**
     * API: Fetch conversations for sidebar
     */
    public function conversations(Request $request)
    {
        $pageId = $request->page_id; // This is the Facebook page_id (e.g., "253335157869306")

        Log::info("Loading conversations", [
            'user_id' => auth()->id(),
            'page_id' => $pageId,
        ]);

        $query = FacebookConversation::with([
            'user:id,facebook_page_id,psid,name,profile_pic',
            'page:id,user_id,page_id,name',
        ]);

        // Filter by user's pages only
        $query->whereHas('page', function ($q) {
            $q->where('user_id', auth()->id());
        });

        // If specific page is selected, filter by Facebook page_id
        if ($pageId) {
            $query->whereHas('page', function ($q) use ($pageId) {
                $q->where('page_id', $pageId);
            });
        }

        $conversations = $query
            ->orderBy('last_message_at', 'desc')
            ->paginate(20);

        Log::info("Conversations loaded", [
            'count' => $conversations->count(),
        ]);

        return response()->json([
            'data' => $conversations->items(),
            'links' => [
                'next' => $conversations->nextPageUrl(),
            ],
        ]);
    }
}
