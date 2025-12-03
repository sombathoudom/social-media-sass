<?php

namespace App\Services\Facebook;

use App\Models\FacebookConversation;
use App\Models\FacebookPage;
use App\Models\FacebookPageUser;

class ConversationService
{
    public function getOrCreateConversation(FacebookPageUser $user, FacebookPage $page)
    {
        return FacebookConversation::firstOrCreate(
            [
                'facebook_page_id'      => $page->id,
                'facebook_page_user_id' => $user->id,
            ],
            [
                'unread_count' => 0,
            ]
        );
    }

    public function markAsRead(FacebookConversation $conversation)
    {
        $conversation->update(['unread_count' => 0]);
    }

    public function updateLastMessage(FacebookConversation $conversation, string $text)
    {
        $conversation->update([
            'last_message'    => $text,
            'last_message_at' => now(),
        ]);
    }
}