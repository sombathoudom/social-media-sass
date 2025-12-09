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
            'enable_beta_mode'      => false,
            'http_client_handler'   => null,
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

    /* ------------------------------------------------------
     *  GENERIC API METHOD
     * ------------------------------------------------------ */

    /**
     * Make a generic API call to Facebook Graph API
     * 
     * @param string $endpoint The API endpoint (e.g., '/me/accounts')
     * @param string $method HTTP method (GET, POST, DELETE)
     * @param array $params Parameters to send
     * @param string $accessToken Access token to use
     * @return array Decoded response body
     */
    public function api(string $endpoint, string $method = 'GET', array $params = [], string $accessToken = null)
    {
        try {
            $method = strtoupper($method);
            
            // Build the full URL
            $baseUrl = 'https://graph.facebook.com/v19.0';
            $endpoint = ltrim($endpoint, '/');
            $url = "{$baseUrl}/{$endpoint}";
            
            // Add access token to params
            $params['access_token'] = $accessToken;
            
            // Make HTTP request using Laravel's HTTP client
            $response = match($method) {
                'GET' => \Illuminate\Support\Facades\Http::get($url, $params),
                'POST' => \Illuminate\Support\Facades\Http::post($url, $params),
                'DELETE' => \Illuminate\Support\Facades\Http::delete($url, $params),
                default => throw new Exception("Unsupported HTTP method: {$method}"),
            };

            if ($response->failed()) {
                $error = $response->json('error.message', 'Unknown error');
                throw new Exception($error);
            }

            return $response->json();

        } catch (Exception $e) {
            Log::error("FB API Error: " . $e->getMessage(), [
                'endpoint' => $endpoint,
                'method' => $method,
            ]);
            throw $e;
        }
    }

    /**
     * Get user profile by PSID
     * 
     * @param string $psid Page-scoped user ID
     * @param string $accessToken Page access token
     * @return array|null User profile data (name, profile_pic)
     */
    public function getUserProfile(string $psid, string $accessToken): ?array
    {
        try {
            $response = $this->api(
                "/{$psid}",
                'GET',
                ['fields' => 'name,profile_pic'],
                $accessToken
            );

            return $response;
        } catch (Exception $e) {
            Log::warning("Failed to fetch user profile: " . $e->getMessage(), [
                'psid' => $psid,
            ]);
            return null;
        }
    }

    /**
     * Get posts from a Facebook page
     * 
     * @param string $pageId Facebook page ID
     * @param string $accessToken Page access token
     * @param int $limit Number of posts to fetch
     * @param string|null $after Cursor for pagination
     * @return array
     */
    public function getPagePosts(string $pageId, string $accessToken, int $limit = 12, ?string $after = null): array
    {
        try {
            $params = [
                'fields' => 'id,message,full_picture,created_time,permalink_url,status_type,likes.summary(true),comments.summary(true)',
                'limit' => $limit,
            ];

            if ($after) {
                $params['after'] = $after;
            }

            $response = $this->api(
                "/{$pageId}/feed",
                'GET',
                $params,
                $accessToken
            );

            return [
                'posts' => $response['data'] ?? [],
                'paging' => $response['paging'] ?? null,
            ];
        } catch (Exception $e) {
            Log::error("Failed to fetch page posts: " . $e->getMessage(), [
                'page_id' => $pageId,
            ]);
            throw $e;
        }
    }


    /**
     * Create a post on Facebook page
     * 
     * @param string $pageId Facebook page ID
     * @param string $accessToken Page access token
     * @param array $data Post data (message, photo_paths, photo_captions, video_path)
     * @return array
     */
    public function createPagePost(string $pageId, string $accessToken, array $data): array
    {
        try {
            // Text-only post or post with message
            if (empty($data['photo_paths']) && empty($data['video_path'])) {
                $response = $this->fb->post("/{$pageId}/feed", [
                    'message' => $data['message'] ?? '',
                ], $accessToken);
                
                return $response->getDecodedBody();
            }

            // Video post
            if (!empty($data['video_path'])) {
                $videoPath = storage_path('app/public/' . $data['video_path']);
                
                $response = $this->fb->post("/{$pageId}/videos", [
                    'description' => $data['message'] ?? '',
                    'source' => $this->fb->videoToUpload($videoPath),
                ], $accessToken);
                
                return $response->getDecodedBody();
            }

            // Single photo post
            if (!empty($data['photo_paths']) && count($data['photo_paths']) === 1) {
                $caption = $data['photo_captions'][0] ?? $data['message'] ?? '';
                $photoPath = storage_path('app/public/' . $data['photo_paths'][0]);
                
                $response = $this->fb->post("/{$pageId}/photos", [
                    'message' => $caption,
                    'source' => $this->fb->fileToUpload($photoPath),
                ], $accessToken);
                
                return $response->getDecodedBody();
            }

            // Multiple photos post (album)
            if (!empty($data['photo_paths']) && count($data['photo_paths']) > 1) {
                $photoCaptions = $data['photo_captions'] ?? [];
                
                // First, upload all photos with their individual captions and get their IDs
                $photoIds = [];
                foreach ($data['photo_paths'] as $index => $photoPath) {
                    $caption = $photoCaptions[$index] ?? '';
                    $fullPath = storage_path('app/public/' . $photoPath);
                    
                    $photoParams = [
                        'source' => $this->fb->fileToUpload($fullPath),
                        'published' => false, // Don't publish yet
                    ];
                    
                    // Add caption if provided
                    if (!empty($caption)) {
                        $photoParams['message'] = $caption;
                    }
                    
                    $photoResponse = $this->fb->post(
                        "/{$pageId}/photos",
                        $photoParams,
                        $accessToken
                    );
                    
                    $photoIds[] = ['media_fbid' => $photoResponse->getDecodedBody()['id']];
                }

                // Then create a post with all photos
                $response = $this->fb->post("/{$pageId}/feed", [
                    'message' => $data['message'] ?? '',
                    'attached_media' => json_encode($photoIds),
                ], $accessToken);
                
                return $response->getDecodedBody();
            }

            throw new Exception('Invalid post data');

        } catch (Exception $e) {
            Log::error("Failed to create page post: " . $e->getMessage(), [
                'page_id' => $pageId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

}
