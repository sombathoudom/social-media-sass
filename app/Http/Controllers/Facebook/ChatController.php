<?php

namespace App\Http\Controllers\Facebook;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

use App\Models\FacebookConversation;
use App\Models\FacebookMessage;
use App\Models\FacebookPage;

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
                $messages = FacebookMessage::where('conversation_id', $activeConversation->id)
                    ->orderBy('id', 'desc')
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
        $messages = FacebookMessage::where('conversation_id', $conversation->id)
            ->orderBy('id', 'desc')
            ->paginate(25);

        return response()->json($messages);
    }

    /**
     * SEND MESSAGE (text, image, audio)
     */
    public function send(FacebookConversation $conversation, Request $request)
    {
        $validated = $request->validate([
            'text' => ['nullable', 'string'],
            'attachment_type' => ['nullable', 'string'], // image/audio/file/video
            'attachment_url'  => ['nullable', 'string'],
        ]);

        // Build payload for ChatService
        $payload = [
            'text' => $validated['text'] ?? null,
            'attachment_type' => $validated['attachment_type'] ?? null,
            'attachment_url' => $validated['attachment_url'] ?? null,
        ];

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
        $pageId = $request->page_id;

        $query = FacebookConversation::with([
            'user:id,facebook_page_id,psid,name,profile_pic',
            'page:id,user_id,page_id,name',
        ]);

        if ($pageId) {
            $query->where('facebook_page_id', $pageId);
        }

        $conversations = $query
            ->orderBy('last_message_at', 'desc')
            ->paginate(20);

        return response()->json([
            'data' => $conversations->items(),
            'links' => [
                'next' => $conversations->nextPageUrl(),
            ],
        ]);
    }
}
