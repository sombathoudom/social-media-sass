<?php

namespace App\Services\Facebook;

use Exception;
use Facebook\Facebook;
use Illuminate\Support\Facades\Log;
use Laravel\Socialite\Facades\Socialite;

class FacebookService
{
    protected Facebook $fb;

    public function __construct()
    {
        $this->fb = new Facebook([
            'app_id'                => config('services.facebook.app_id'),
            'app_secret'            => config('services.facebook.app_secret'),
            'default_graph_version' => 'v19.0',
        ]);
    }

    /* ------------------------------------------------------
     *  OAUTH — Get Login URL (Handled by Controller)
     * ------------------------------------------------------ */

    public function getLoginUrl()
    {
        /** @var \Laravel\Socialite\Two\FacebookProvider $driver */
        $driver = Socialite::driver('facebook');

        return $driver
            ->scopes([
                'email',
                'public_profile',

                // PAGES
                'pages_show_list',
                'pages_read_engagement',
                'pages_manage_metadata',
                'pages_manage_posts',
                'pages_manage_engagement',
                'pages_read_user_content',

                // INBOX / MESSAGING
                'pages_messaging',
                // 'pages_messaging_subscriptions'
            ])
            ->stateless()
            ->redirect()
            ->getTargetUrl();
    }

    /* ------------------------------------------------------
     *  EXCHANGE TOKEN FOR LONG-LIVED TOKEN
     * ------------------------------------------------------ */

    public function exchangeForLongLivedToken($user)
    {
        try {
            $shortLived = decrypt($user->facebook_token);

            $oAuth = $this->fb->getOAuth2Client();

            $longToken = $oAuth->getLongLivedAccessToken($shortLived);

            $user->update([
                'facebook_token' => encrypt($longToken->getValue())
            ]);

            return $longToken->getValue();

        } catch (Exception $e) {
            Log::error("FB Long Token Error: " . $e->getMessage());
            return null;
        }
    }

    /* ------------------------------------------------------
     *  USER PAGES
     * ------------------------------------------------------ */

    public function getUserPages($user)
    {
        try {
            $token = decrypt($user->facebook_token);

            $response = $this->fb->get('/me/accounts', $token);

            return $response->getDecodedBody()['data'] ?? [];

        } catch (Exception $e) {
            Log::error("FB Pages Error: " . $e->getMessage());
            return [];
        }
    }

    /* ------------------------------------------------------
     *  GET PAGE ACCESS TOKEN
     * ------------------------------------------------------ */

    public function getPageAccessToken($user, string $pageId)
    {
        $page = $user->facebookPages()->where('page_id', $pageId)->first();

        if (!$page) {
            throw new Exception("Page not found or not owned by user.");
        }

        return decrypt($page->access_token);
    }

    /* ------------------------------------------------------
     *  POST COMMENT (Auto Reply on post)
     * ------------------------------------------------------ */

    public function postComment(string $postId, string $message, string $pageToken)
    {
        try {
            return $this->fb->post("/{$postId}/comments", [
                'message' => $message,
            ], $pageToken);

        } catch (Exception $e) {
            Log::error("FB Comment Error: " . $e->getMessage());
            return null;
        }
    }

    /* ------------------------------------------------------
     *  SEND MESSAGE (Inbox reply)
     * ------------------------------------------------------ */

    public function sendMessage(string $recipientId, string $message, string $pageToken)
    {
        try {
            return $this->fb->post("/{$recipientId}/messages", [
                'message' => ['text' => $message]
            ], $pageToken);

        } catch (Exception $e) {
            Log::error("FB Message Error: " . $e->getMessage());
            return null;
        }
    }

    /* ------------------------------------------------------
     *  REPLY TO LIVE COMMENT
     * ------------------------------------------------------ */

    public function replyLiveComment(string $commentId, string $message, string $pageToken)
    {
        try {
            return $this->fb->post("/{$commentId}/comments", [
                'message' => $message
            ], $pageToken);

        } catch (Exception $e) {
            Log::error("FB Live Reply Error: " . $e->getMessage());
            return null;
        }
    }

    /* ------------------------------------------------------
     *  BROADCAST MESSAGE (send to page feed)
     * ------------------------------------------------------ */

    public function publishToPageFeed(string $pageId, string $message, string $pageToken)
    {
        try {
            return $this->fb->post("/{$pageId}/feed", [
                'message' => $message,
            ], $pageToken);

        } catch (Exception $e) {
            Log::error("FB Broadcast Error: " . $e->getMessage());
            return null;
        }
    }

    /* ------------------------------------------------------
     * FETCH POST COMMENTS (for Live monitor)
     * ------------------------------------------------------ */
    public function getPostComments(string $postId, string $pageToken)
    {
        try {
            $res = $this->fb->get("/{$postId}/comments?filter=stream&live_filter=no_filter", $pageToken);
            return $res->getDecodedBody()['data'] ?? [];

        } catch (Exception $e) {
            Log::error("FB get comments error: {$e->getMessage()}");
            return [];
        }
    }

    /* ------------------------------------------------------
     * FETCH LIVE VIDEO COMMENTS
     * ------------------------------------------------------ */
    public function getLiveComments(string $liveId, string $pageToken)
    {
        try {
            $res = $this->fb->get("/{$liveId}/comments?filter=stream&live_filter=filter", $pageToken);
            return $res->getDecodedBody()['data'] ?? [];

        } catch (Exception $e) {
            Log::error("FB live comment error: {$e->getMessage()}");
            return [];
        }
    }

    /* ------------------------------------------------------
     * FETCH INBOX MESSAGES
     * ------------------------------------------------------ */
    public function getInboxMessages(string $pageId, string $pageToken)
    {
        try {
            $res = $this->fb->get("/{$pageId}/conversations?fields=messages", $pageToken);
            return $res->getDecodedBody()['data'] ?? [];

        } catch (Exception $e) {
            Log::error("FB inbox fetch error: {$e->getMessage()}");
            return [];
        }
    }

    /* ------------------------------------------------------
     *  DEBUG TOKEN (optional)
     * ------------------------------------------------------ */

    public function debugToken($user)
    {
        try {
            $token = decrypt($user->facebook_token);

            $res = $this->fb->get("/debug_token?input_token={$token}", $token);

            return $res->getDecodedBody();

        } catch (Exception $e) {
            Log::error("FB Debug Error: " . $e->getMessage());
            return null;
        }
    }
}
