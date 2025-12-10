<?php

namespace App\Jobs\Facebook;

use App\Services\Facebook\FacebookService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessAutoReplyInboxJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $user;
    protected array $payload;

    public function __construct($user, array $payload)
    {
        $this->user = $user;
        $this->payload = $payload;
    }

    public function handle(FacebookService $fb)
    {
        try {
            // Fetch access token from database instead of payload
            $page = \App\Models\FacebookPage::find($this->payload['page_db_id']);
            if (!$page) {
                throw new \Exception('Page not found');
            }

            $fb->sendMessage(
                $this->payload['recipient_id'],
                $this->payload['message'],
                decrypt($page->access_token)
            );

        } catch (\Exception $e) {
            Log::error("InboxAutoReply Error: " . $e->getMessage());
        }
    }
}
