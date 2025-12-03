<?php

namespace App\Jobs\Facebook;

use App\Services\Facebook\FacebookService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessAutoReplyJob implements ShouldQueue
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
            $fb->postComment(
                $this->payload['comment_id'],
                $this->payload['message'],
                decrypt($this->payload['page_token'])
            );

        } catch (\Exception $e) {
            Log::error("AutoReplyJob Error: " . $e->getMessage());
        }
    }
}
