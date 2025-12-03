<?php

namespace App\Services\Facebook;

use App\Models\Conversation;
use App\Models\Message;
use App\Events\MessageSent;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\UploadedFile;
use Facebook\Facebook;

class FacebookChatService
{
    public function __construct(
        protected Facebook $fb // nickdnk/php-graph-sdk instance (configured in service provider)
    ) {}

    public function sendMessage(
        int $conversationId,
        string $type,
        ?string $message = null,
        ?UploadedFile $image = null,
        ?UploadedFile $audio = null,
    ): Message {
        $conversation = Conversation::findOrFail($conversationId);

        // 1. Determine message content + upload files if needed
        $content = $this->prepareContent($type, $image, $audio, $message);

        // 2. Send message to Facebook Graph API
        $this->sendToFacebook(
            $conversation->page_access_token,
            $conversation->user_facebook_id,
            $type,
            $content
        );

        // 3. Save to database
        $msgModel = $this->storeMessage($conversationId, $type, $content);

        // 4. Broadcast real-time update
        broadcast(new MessageSent($msgModel))->toOthers();

        return $msgModel;
    }

    protected function prepareContent(
        string $type,
        ?UploadedFile $image,
        ?UploadedFile $audio,
        ?string $text
    ): string {
        return match ($type) {
            'text' => $text,

            'image' => $image
                ? Storage::url($image->store('chat/images', 'public'))
                : null,

            'voice' => $audio
                ? Storage::url($audio->store('chat/voices', 'public'))
                : null,

            default => '',
        };
    }

    protected function storeMessage(int $conversationId, string $type, string $content): Message
    {
        return Message::create([
            'conversation_id' => $conversationId,
            'from_type' => 'page',
            'message_type' => $type,
            'message' => $content,
        ]);
    }

    protected function sendToFacebook(
        string $pageAccessToken,
        string $userId,
        string $type,
        string $content
    ): void {
        $payload = match ($type) {
            'text' => [
                'recipient' => ['id' => $userId],
                'message'   => ['text' => $content],
            ],

            'image' => [
                'recipient' => ['id' => $userId],
                'message'   => [
                    'attachment' => [
                        'type' => 'image',
                        'payload' => ['url' => $content],
                    ]
                ],
            ],

            'voice' => [
                'recipient' => ['id' => $userId],
                'message'   => [
                    'attachment' => [
                        'type' => 'audio',
                        'payload' => ['url' => $content],
                    ]
                ],
            ],
        };

        $this->fb->post('/me/messages', $payload, $pageAccessToken);
    }
}
