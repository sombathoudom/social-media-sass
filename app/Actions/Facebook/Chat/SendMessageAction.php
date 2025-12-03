<?php
namespace App\Actions\Facebook\Chat;

use App\Models\FacebookConversation;
use App\Services\Facebook\ChatService;

class SendMessageAction
{
    protected ChatService $service;

    public function __construct(ChatService $service)
    {
        $this->service = $service;
    }

    public function execute(FacebookConversation $conversation, array $data)
    {
        return $this->service->sendMessage($conversation, $data);
    }
}
