<?php

namespace App\Services\Facebook;

use App\Models\FacebookConversation;
use App\Models\FacebookMessage;
use Carbon\Carbon;
use Facebook\Facebook;
use Illuminate\Support\Facades\Log;

class ChatService
{
    protected Facebook $fb;

    public function __construct()
    {
        $this->fb = new Facebook([
            'app_id'                => config('services.facebook.client_id'),
            'app_secret'            => config('services.facebook.client_secret'),
            'default_graph_version' => 'v20.0',
        ]);
    }

    /**
     * Main sendMessage handler
     * Accepts: text, image, audio, video, file
     */
    public function sendMessage(FacebookConversation $conversation, array $data): FacebookMessage
    {
        $page     = $conversation->page;
        $recipient = $conversation->user->psid; // PAGE-SCOPED USER ID

        // ----------------------------------------------------
        // Build Facebook payload
        // ----------------------------------------------------
        $payload = [
            'recipient' => [
                'id' => $recipient,
            ],
            'message' => [],
        ];

        // TEXT
        if (!empty($data['text'])) {
            $payload['message']['text'] = $data['text'];
        }

        // ATTACHMENTS
        if (!empty($data['attachment_type']) && !empty($data['attachment_url'])) {
            $payload['message']['attachment'] = [
                'type'    => $data['attachment_type'], // image|audio|video|file
                'payload' => [
                    'url'         => $data['attachment_url'],
                    'is_reusable' => true,
                ],
            ];
        }

        // ----------------------------------------------------
        // SEND TO FACEBOOK
        // ----------------------------------------------------
        try {
            $this->fb->post(
                '/me/messages',
                $payload,
                $page->access_token
            );
        } catch (\Throwable $e) {
            Log::error('Facebook Send Message Error: ' . $e->getMessage());
        }

        // ----------------------------------------------------
        // Determine message type & content for DB
        // ----------------------------------------------------
        $messageType = 'text';
        $content     = $data['text'] ?? null;

        if (!empty($data['attachment_type'])) {
            $messageType = $data['attachment_type']; // image|audio|video|file
            $content     = $data['attachment_url'];
        }

        // ----------------------------------------------------
        // Save to DB
        // ----------------------------------------------------
        $message = FacebookMessage::create([
            'conversation_id' => $conversation->id,
            'from_type'       => 'page',
            'message_type'    => $messageType,
            'message'         => $content,
            'attachments'     => $payload['message']['attachment'] ?? null,
            'sent_at'         => Carbon::now(),
        ]);

        // Update conversation metadata
        $conversation->update([
            'last_message'    => $content,
            'last_message_at' => now(),
        ]);

        // Broadcast to frontend
        broadcast(new \App\Events\MessageSent($message))->toOthers();

        return $message;
    }
}
