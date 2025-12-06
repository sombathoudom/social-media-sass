<?php

namespace App\Actions\Facebook;

use App\Models\FacebookPage;
use App\Services\Facebook\FacebookService;
use Illuminate\Support\Facades\Log;

class SubscribePageToWebhookAction
{
    public function __construct(
        protected FacebookService $fb
    ) {}

    /**
     * Subscribe a Facebook page to webhook events
     */
    public function execute(FacebookPage $page): bool
    {
        try {
            $accessToken = decrypt($page->access_token);
            
            // Subscribe to webhook events
            $response = $this->fb->api(
                "/{$page->page_id}/subscribed_apps",
                'POST',
                [
                    'subscribed_fields' => implode(',', [
                        'feed',
                        'messages'
                    //     'messages',           // Inbox messages
                    //     'messaging_postbacks', // Postback events
                    //     'feed',               // Page feed (includes comments)
                    //    // 'live_videos',        // Live video events
                    //     'mention',            // Mentions
                    //     'message_reactions',  // Message reactions
                    //     'message_reads',      // Message read receipts
                    //     'messaging_optins',   // Messaging opt-ins
                    //     'comments'
                    ]),
                ],
                $accessToken
            );

            if (isset($response['success']) && $response['success']) {
                Log::info("Page subscribed to webhook", [
                    'page_id' => $page->page_id,
                    'page_name' => $page->name,
                ]);
                return true;
            }

            Log::warning("Page subscription returned unexpected response", [
                'page_id' => $page->page_id,
                'response' => $response,
            ]);
            
            return false;
        } catch (\Exception $e) {
            Log::error("Failed to subscribe page to webhook", [
                'page_id' => $page->page_id,
                'error' => $e->getMessage(),
            ]);
            
            return false;
        }
    }

    /**
     * Subscribe multiple pages to webhook
     */
    public function executeForUser($user): array
    {
        $results = [
            'success' => [],
            'failed' => [],
        ];

        $pages = FacebookPage::where('user_id', $user->id)->get();

        foreach ($pages as $page) {
            if ($this->execute($page)) {
                $results['success'][] = $page->name;
            } else {
                $results['failed'][] = $page->name;
            }
        }

        return $results;
    }

    /**
     * Check if a page is subscribed to the app
     */
    public function checkSubscription(FacebookPage $page): array
    {
        try {
            $accessToken = decrypt($page->access_token);
            
            $response = $this->fb->api(
                "/{$page->page_id}/subscribed_apps",
                'GET',
                [],
                $accessToken
            );

            return [
                'subscribed' => !empty($response['data']),
                'fields' => $response['data'][0]['subscribed_fields'] ?? [],
            ];
        } catch (\Exception $e) {
            Log::error("Failed to check page subscription", [
                'page_id' => $page->page_id,
                'error' => $e->getMessage(),
            ]);
            
            return [
                'subscribed' => false,
                'fields' => [],
            ];
        }
    }
}
