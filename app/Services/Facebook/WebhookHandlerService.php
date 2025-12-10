<?php

namespace App\Services\Facebook;

use App\Models\FacebookAutoReplyRule;
use App\Models\FacebookPage;
use App\Models\FacebookPageUser;
use App\Models\FacebookConversation;
use App\Models\FacebookMessage;
use App\Jobs\Facebook\ProcessAutoReplyJob;
use App\Jobs\Facebook\ProcessAutoReplyInboxJob;
use App\Jobs\Facebook\ProcessLiveCommentJob;
use Illuminate\Support\Facades\Log;
use App\Services\Facebook\FacebookUserService;
use App\Services\Facebook\ConversationService;
use App\Services\Facebook\ChatService;
use App\Services\Facebook\CommentAutomationService;

class WebhookHandlerService
{
    public function __construct(
        protected FacebookUserService $userService,
        protected ConversationService $conversationService,
        protected ChatService $chatService,
        protected CommentAutomationService $commentAutomation,
        protected FacebookService $facebookService,
    ) {}
    /**
     * VERIFY WEBHOOK
     */
    public function verifyWebhook($request)
    {
        $mode = $request->hub_mode;
        $token = $request->hub_verify_token;
        $challenge = $request->hub_challenge;

        if ($mode === 'subscribe' && $token === config('services.facebook.verify_token')) {
            Log::info("Facebook Webhook Verified.");
            return response($challenge, 200);
        }

        Log::warning("Facebook Webhook Verification Failed.");
        return response('Verification token mismatch', 403);
    }

    /**
     * HANDLE FB EVENTS
     */
    public function handleEvent(array $payload)
    {
        Log::info("FB Webhook Payload:", $payload);

        if (!isset($payload['entry'])) {
            return;
        }

        foreach ($payload['entry'] as $entry) {
            $pageId = $entry['id'] ?? null; // Page ID from entry level

            /* ------------------------------------------------------
             * HANDLE COMMENTS
             * ------------------------------------------------------ */
            if (isset($entry['changes'])) {
                foreach ($entry['changes'] as $change) {
                    // Facebook sends comment events under 'feed' or 'comments' field
                    if (in_array($change['field'], ['comments', 'feed'])) {
                        // Check if this is actually a comment event
                        if (isset($change['value']['item']) && $change['value']['item'] === 'comment') {
                            $this->handleCommentEvent($change, $pageId);
                        }
                    }
                }
            }

            /* ------------------------------------------------------
             * HANDLE INBOX MESSAGES
             * ------------------------------------------------------ */
            if (isset($entry['messaging'])) {
                foreach ($entry['messaging'] as $messageEvent) {
                    $this->handleInboxEvent($messageEvent);
                }
            }

            /* ------------------------------------------------------
             * HANDLE LIVE VIDEO COMMENTS
             * ------------------------------------------------------ */
            if (isset($entry['changes'])) {
                foreach ($entry['changes'] as $change) {
                    if ($change['field'] === 'live_videos') {
                        $this->handleLiveEvent($change);
                    }
                }
            }
        }
    }

    /* ------------------------------------------------------
     * COMMENTS (AUTO REPLY)
     * ------------------------------------------------------ */
    protected function handleCommentEvent($change, $pageId = null)
    {
        $value = $change['value'];

        // Page ID can come from value or from entry level (passed as parameter)
        $pageId = $value['page_id'] ?? $pageId;
        $postId = $value['post_id'] ?? null;
        $commentId = $value['comment_id'];
        $senderId = $value['from']['id'] ?? null;
        $message = $value['message'] ?? '';

        if (!$pageId || !$senderId || !$commentId) {
            Log::warning("Missing required comment data", [
                'page_id' => $pageId,
                'sender_id' => $senderId,
                'comment_id' => $commentId,
            ]);
            return;
        }

        // Avoid replying to ourselves
        if ($senderId === $pageId) {
            Log::info("Skipping self-comment", ['comment_id' => $commentId]);
            return;
        }

        Log::info("Processing comment", [
            'comment_id' => $commentId,
            'page_id' => $pageId,
            'message' => $message,
        ]);

        // Process with new Comment Automation Service
        $this->commentAutomation->processComment(
            $commentId,
            $message,
            $pageId,
            $value
        );

        // Keep old auto-reply rules for backward compatibility
        $page = FacebookPage::where('page_id', $pageId)->first();
        if (!$page) {
            Log::warning("Page not found in database", ['page_id' => $pageId]);
            return;
        }

        $rules = FacebookAutoReplyRule::where('facebook_page_id', $page->id)
            ->where('type', 'comment')
            ->where('enabled', true)
            ->get();

        foreach ($rules as $rule) {
            if (str_contains(strtolower($message), strtolower($rule->trigger_keyword))) {
                ProcessAutoReplyJob::dispatch(
                    $page->owner,
                    [
                        'comment_id' => $commentId,
                        'message' => $rule->reply_message,
                        'page_db_id' => $page->id,
                    ]
                );
            }
        }
    }

    /* ------------------------------------------------------
     * INBOX MESSAGES (AUTO REPLY + STORE MESSAGE)
     * ------------------------------------------------------ */
    protected function handleInboxEvent($event)
    {
        Log::info("Processing inbox message event", ['event' => $event]);

        // First, store the message in the database
        $this->handleMessagingEvent($event);

        // Then process auto-reply rules
        $senderId = $event['sender']['id'];
        $pageId = $event['recipient']['id'];
        $message = $event['message']['text'] ?? null;

        if (!$message) return;

        $page = FacebookPage::where('page_id', $pageId)->first();
        if (!$page) return;

        $rules = FacebookAutoReplyRule::where('facebook_page_id', $page->id)
            ->where('type', 'inbox')
            ->where('enabled', true)
            ->get();

        foreach ($rules as $rule) {
            if (str_contains(strtolower($message), strtolower($rule->trigger_keyword))) {

                ProcessAutoReplyInboxJob::dispatch(
                    $page->owner,
                    [
                        'recipient_id' => $senderId,
                        'message' => $rule->reply_message,
                        'page_db_id' => $page->id,
                    ]
                );
            }
        }
    }

    /* ------------------------------------------------------
     * LIVE VIDEO COMMENT EVENTS
     * ------------------------------------------------------ */
    protected function handleLiveEvent($change)
    {
        $value = $change['value'];

        $pageId = $value['page_id'];
        $commentId = $value['comment_id'] ?? null;
        $message = $value['message'] ?? null;

        if (!$commentId || !$message) return;

        $page = FacebookPage::where('page_id', $pageId)->first();
        if (!$page) return;

        $rules = FacebookAutoReplyRule::where('facebook_page_id', $page->id)
            ->where('type', 'live')
            ->where('enabled', true)
            ->get();

        foreach ($rules as $rule) {

            if (str_contains(strtolower($message), strtolower($rule->trigger_keyword))) {

                ProcessLiveCommentJob::dispatch(
                    $page->owner,
                    [
                        'comment_id' => $commentId,
                        'message' => $rule->reply_message,
                        'page_db_id' => $page->id,
                    ]
                );
            }
        }
    }

    public function handleMessagingEvent(array $event): void
    {
        // --------------------------------------------------------
        // Extract PSID (page-scoped user id) and Page ID
        // --------------------------------------------------------
        $psid   = $event['sender']['id']     ?? null;
        $pageId = $event['recipient']['id'] ?? null;

        if (!$psid || !$pageId) {
            return;
        }

        // --------------------------------------------------------
        // Find Facebook Page
        // --------------------------------------------------------
        $page = FacebookPage::where('page_id', $pageId)->first();
        if (!$page) {
            Log::warning("Webhook: FB Page not found: {$pageId}");
            return;
        }

        // --------------------------------------------------------
        // Extract message content
        // --------------------------------------------------------
        $messageText = $event['message']['text'] ?? null;
        $attachments = $event['message']['attachments'][0] ?? null;

        // --------------------------------------------------------
        // 1. SYNC Facebook Page User (PSID + profile)
        // --------------------------------------------------------
        // Fetch user profile from Facebook if we don't have it
        $userData = [
            'last_interaction_at' => now(),
        ];

        // Try to get name and profile pic from Facebook API using FacebookService
        try {
            $accessToken = decrypt($page->access_token);
            $profile = $this->facebookService->getUserProfile($psid, $accessToken);
            
            if ($profile) {
                $userData['name'] = $profile['name'] ?? null;
                $userData['profile_pic'] = $profile['profile_pic'] ?? null;
                
                Log::info("User profile fetched successfully", [
                    'psid' => $psid,
                    'name' => $userData['name'],
                ]);
            }
        } catch (\Exception $e) {
            Log::warning("Failed to fetch user profile: " . $e->getMessage());
        }

        $fbUser = FacebookPageUser::updateOrCreate(
            [
                'facebook_page_id' => $page->id,
                'psid'             => $psid,
            ],
            $userData
        );

        // --------------------------------------------------------
        // 2. FIND or CREATE Conversation
        // --------------------------------------------------------
        $isNewConversation = !FacebookConversation::where([
            'facebook_page_id'      => $page->id,
            'facebook_page_user_id' => $fbUser->id,
        ])->exists();

        $conversation = FacebookConversation::firstOrCreate(
            [
                'facebook_page_id'      => $page->id,
                'facebook_page_user_id' => $fbUser->id,
            ],
            [
                'unread_count' => 0,
            ]
        );

        // Broadcast new conversation event if it's a new conversation
        if ($isNewConversation) {
            broadcast(new \App\Events\NewConversation($conversation))->toOthers();
            Log::info("New conversation created and broadcasted", [
                'conversation_id' => $conversation->id,
                'page_id' => $page->page_id,
            ]);
        }

        // --------------------------------------------------------
        // 3. Store incoming message
        // --------------------------------------------------------
        $type    = 'text';
        $content = $messageText;

        if ($attachments) {
            $type    = $attachments['type']; // image, audio, video, file, etc.
            $content = $attachments['payload']['url'] ?? null;
        }

        $facebookMessage = FacebookMessage::create([
            'conversation_id' => $conversation->id,
            'from_type'       => 'user',
            'message_type'    => $type,
            'message'         => $content,
            'attachments'     => $attachments,
            'sent_at'         => now(),
        ]);

        // --------------------------------------------------------
        // 4. Update Conversation
        // --------------------------------------------------------
        $conversation->update([
            'last_message'    => $content,
            'last_message_at' => now(),
        ]);

        $conversation->increment('unread_count');
        $conversation->touch();

        // --------------------------------------------------------
        // 5. Broadcast to frontend (Laravel Reverb)
        // --------------------------------------------------------
        broadcast(new \App\Events\MessageSent($facebookMessage))
            ->toOthers();
    }
}
