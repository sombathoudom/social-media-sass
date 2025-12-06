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
     * LOAD PAGINATED MESSAGES (for infinite scroll) - OPTIMIZED
     */
    public function messages(FacebookConversation $conversation, Request $request)
    {
        // Check if user owns this conversation's page
        if ($conversation->page->user_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        $query = FacebookMessage::select([
            'id',
            'conversation_id',
            'from_type',
            'message_type',
            'message',
            'sent_at',
            'created_at'
        ])
        ->where('conversation_id', $conversation->id);

        // Load older messages (for infinite scroll)
        if ($request->before_id) {
            $query->where('id', '<', $request->before_id);
        }

        $messages = $query
            ->orderBy('id', 'desc') // Get newest first
            ->limit(30)
            ->get()
            ->reverse() // Reverse to show oldest first
            ->values();

        return response()->json([
            'data' => $messages,
            'links' => [
                'next' => $messages->count() === 30 ? 'has_more' : null,
            ],
        ]);
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
            'image' => ['nullable', 'file', 'mimes:jpg,jpeg,png,gif,webp,heic', 'max:10240'], // 10MB
            'images' => ['nullable', 'array'], // Support multiple images
            'images.*' => ['file', 'mimes:jpg,jpeg,png,gif,webp,heic', 'max:10240'],
            'audio' => ['nullable', 'file', 'mimes:mp3,wav,ogg,m4a,aac,webm,opus,flac', 'max:10240'],
            'video' => ['nullable', 'file', 'mimes:mp4,mov,avi', 'max:25600'], // 25MB
            'file' => ['nullable', 'file', 'max:25600'],
        ]);

        $payload = [
            'text' => $validated['text'] ?? null,
            'attachment_type' => $validated['attachment_type'] ?? null,
            'attachment_url' => $validated['attachment_url'] ?? null,
        ];

        // Handle file uploads
        if ($request->hasFile('images')) {
            // Multiple images
            $urls = [];
            foreach ($request->file('images') as $image) {
                $path = $image->store('chat/images', 'public');
                $urls[] = url('storage/' . $path);
            }
            $payload['attachment_type'] = 'image';
            $payload['attachment_url'] = $urls[0]; // Send first image to Facebook
            // TODO: Send remaining images as separate messages
        } elseif ($request->hasFile('image')) {
            $path = $request->file('image')->store('chat/images', 'public');
            $payload['attachment_type'] = 'image';
            $payload['attachment_url'] = url('storage/' . $path); // Use url() for full URL with ngrok
        } elseif ($request->hasFile('audio')) {
            $path = $request->file('audio')->store('chat/audio', 'public');
            $payload['attachment_type'] = 'voice'; // Changed from 'audio' to 'voice' to match DB constraint
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
     * API: Fetch conversations for sidebar (OPTIMIZED)
     */
    public function conversations(Request $request)
    {
        $pageId = $request->page_id;

        Log::info("Loading conversations", [
            'user_id' => auth()->id(),
            'page_id' => $pageId,
        ]);

        // Optimize query with select and eager loading
        $query = FacebookConversation::select([
            'id',
            'facebook_page_id',
            'facebook_page_user_id',
            'last_message',
            'last_message_at',
            'unread_count',
            'updated_at'
        ])
        ->with([
            'user:id,facebook_page_id,psid,name,profile_pic',
            'page:id,user_id,page_id,name',
        ]);

        // Filter by user's pages only (optimized with join)
        $query->whereHas('page', function ($q) {
            $q->where('user_id', auth()->id());
        });

        // If specific page is selected, filter by Facebook page_id
        if ($pageId) {
            $query->whereHas('page', function ($q) use ($pageId) {
                $q->where('page_id', $pageId);
            });
        }

        // Add index on last_message_at for faster sorting
        $conversations = $query
            ->orderBy('last_message_at', 'desc')
            ->limit(50) // Limit to 50 most recent conversations
            ->get();

        Log::info("Conversations loaded", [
            'count' => $conversations->count(),
        ]);

        return response()->json([
            'data' => $conversations,
            'links' => [
                'next' => null, // Remove pagination for better performance
            ],
        ]);
    }
}
