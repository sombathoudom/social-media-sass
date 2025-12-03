<?php
namespace App\Actions\Facebook\Chat;

use App\Models\FacebookPage;
use App\Models\FacebookPageUser;
use App\Models\FacebookConversation;
use App\Models\FacebookMessage;
use App\Events\Facebook\NewChatMessage;
use Carbon\Carbon;

class HandleIncomingMessageAction
{
    public function execute(array $event)
    {
        $pageId = $event['recipient']['id'];
        $senderId = $event['sender']['id'];

        $page = FacebookPage::where('page_id', $pageId)->firstOrFail();

        $user = FacebookPageUser::updateOrCreate(
            ['facebook_page_id' => $page->id, 'psid' => $senderId],
            [
                'name' => $event['sender']['name'] ?? 'Unknown User',
                'last_interaction_at' => Carbon::now(),
            ]
        );

        $conversation = FacebookConversation::firstOrCreate(
            [
                'facebook_page_id' => $page->id,
                'facebook_page_user_id' => $user->id,
            ]
        );

        $messageText = $event['message']['text'] ?? null;
        $attachments = $event['message']['attachments'] ?? null;

        $type = 'text';
        if ($attachments) {
            $type = $attachments[0]['type'];
        }

        $message = FacebookMessage::create([
            'conversation_id' => $conversation->id,
            'from_type' => 'user',
            'message_type' => $type,
            'message' => $messageText ?? ($attachments[0]['payload']['url'] ?? null),
            'attachments' => $attachments,
            'sent_at' => Carbon::now(),
        ]);

        broadcast(new NewChatMessage($message))->toOthers();

        return $message;
    }
}
