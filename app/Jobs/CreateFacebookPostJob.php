<?php

namespace App\Jobs;

use App\Services\Facebook\FacebookService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class CreateFacebookPostJob implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public int $pageDbId,
        public string $pageId,
        public string $accessToken,
        public array $postData
    ) {}

    /**
     * Execute the job.
     */
    public function handle(FacebookService $facebookService): void
    {
        try {
            Log::info('Starting Facebook post creation job', [
                'page_id' => $this->pageId,
                'post_data' => $this->postData,
            ]);

            $result = $facebookService->createPagePost(
                $this->pageId,
                $this->accessToken,
                $this->postData
            );

            Log::info('Facebook post created successfully', [
                'page_id' => $this->pageId,
                'post_id' => $result['id'] ?? null,
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to create Facebook post in job', [
                'page_id' => $this->pageId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }
}
