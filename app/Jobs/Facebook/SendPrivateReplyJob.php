<?php

namespace App\Jobs\Facebook;

use App\Services\Facebook\FacebookService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class SendPrivateReplyJob implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public string $commentId,
        public string $message,
        public int $pageDbId,
        public int $delaySeconds = 0
    ) {
        // Set delay if specified
        if ($delaySeconds > 0) {
            $this->delay(now()->addSeconds($delaySeconds));
        }
    }

    /**
     * Execute the job.
     */
    public function handle(FacebookService $facebookService): void
    {
        try {
            // Fetch access token from database
            $page = \App\Models\FacebookPage::find($this->pageDbId);
            if (!$page) {
                throw new \Exception('Page not found');
            }

            $result = $facebookService->sendPrivateReply(
                $this->commentId,
                $this->message,
                decrypt($page->access_token)
            );

            Log::info('Private reply sent successfully', [
                'comment_id' => $this->commentId,
                'page_id' => $page->page_id,
                'delay_seconds' => $this->delaySeconds,
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to send private reply', [
                'comment_id' => $this->commentId,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }
}
