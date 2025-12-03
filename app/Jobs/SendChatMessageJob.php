<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class SendChatMessageJob implements ShouldQueue
{
    public function __construct(
        public FacebookConversation $conversation,
        public array $payload
    ) {}

    public function handle()
    {
        app(SendMessageAction::class)->execute($this->conversation, $this->payload);
    }
}

