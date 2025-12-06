<?php

namespace App\Events;

use App\Models\FacebookConversation;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewConversation implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public FacebookConversation $conversation)
    {
    }

    public function broadcastOn()
    {
        // Broadcast to the page channel
        return new Channel('page.' . $this->conversation->page->page_id);
    }

    public function broadcastAs()
    {
        return 'new.conversation';
    }

    public function broadcastWith()
    {
        return [
            'conversation' => $this->conversation->load('user', 'page')->toArray(),
        ];
    }
}
