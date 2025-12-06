<?php

namespace App\Services\Facebook;

use App\Models\AutoReplyCampaign;
use App\Models\FacebookPage;
use App\Models\CommentAutomationLog;
use Illuminate\Support\Facades\Log;

class CommentAutomationService
{
    public function __construct(
        protected FacebookService $fb
    ) {}

    /**
     * Process a comment based on active campaigns
     */
    public function processComment(string $commentId, string $commentText, string $pageId, array $commentData = [])
    {
        try {
            Log::info("CommentAutomationService: Starting to process comment", [
                'comment_id' => $commentId,
                'page_id' => $pageId,
                'comment_text' => $commentText,
            ]);

            // Find the Facebook page
            $page = FacebookPage::where('page_id', $pageId)->first();
            
            if (!$page) {
                Log::warning("Page not found: {$pageId}");
                return;
            }

            Log::info("Page found", ['page_name' => $page->name, 'page_db_id' => $page->id]);

            // Get active campaigns for this page
            $campaigns = $this->getActiveCampaignsForPage($page);

            Log::info("Active campaigns found", ['count' => $campaigns->count()]);

            if ($campaigns->isEmpty()) {
                Log::info("No active campaigns for page: {$pageId}");
                return;
            }

            foreach ($campaigns as $campaign) {
                Log::info("Processing campaign", [
                    'campaign_id' => $campaign->id,
                    'campaign_name' => $campaign->name,
                ]);
                $this->processCampaign($campaign, $commentId, $commentText, $page, $commentData);
            }
        } catch (\Exception $e) {
            Log::error("Error processing comment: " . $e->getMessage(), [
                'comment_id' => $commentId,
                'page_id' => $pageId,
                'trace' => $e->getTraceAsString(),
            ]);
        }
    }

    /**
     * Get active campaigns for a page
     */
    protected function getActiveCampaignsForPage(FacebookPage $page)
    {
        return AutoReplyCampaign::where('is_active', true)
            ->where('user_id', $page->user_id)
            ->where(function ($query) use ($page) {
                // Apply to all pages OR specific page is selected
                $query->where('apply_to_all_pages', true)
                    ->orWhereHas('facebookPages', function ($q) use ($page) {
                        $q->where('facebook_pages.id', $page->id);
                    });
            })
            ->with(['offensiveReplyTemplate'])
            ->get();
    }

    /**
     * Process a single campaign against a comment
     */
    protected function processCampaign(AutoReplyCampaign $campaign, string $commentId, string $commentText, FacebookPage $page, array $commentData)
    {
        Log::info("processCampaign: Starting", [
            'campaign_id' => $campaign->id,
            'comment_id' => $commentId,
        ]);

        // Check if already processed by this campaign
        $alreadyProcessed = CommentAutomationLog::where('auto_reply_campaign_id', $campaign->id)
            ->where('comment_id', $commentId)
            ->exists();

        if ($alreadyProcessed && !$campaign->allow_multiple_replies) {
            Log::info("Comment already processed by campaign", [
                'campaign_id' => $campaign->id,
                'comment_id' => $commentId,
            ]);
            return;
        }

        $userId = $commentData['from']['id'] ?? 'unknown';
        $actions = [];

        // Check for offensive content first
        if ($campaign->delete_offensive && $this->isOffensive($commentText, $campaign)) {
            Log::info("Offensive comment detected");
            $this->handleOffensiveComment($campaign, $commentId, $page, $commentData);
            
            // Log offensive comment handling
            $this->logAction($campaign, $page, $commentId, $userId, $commentText, 'deleted', null, true);
            return;
        }

        // Like the comment if enabled
        if ($campaign->like_comment) {
            Log::info("Liking comment");
            $this->likeComment($commentId, $page);
            $actions[] = 'liked';
        }

        // Process reply based on type
        $replyMessage = null;
        if ($campaign->enable_comment_reply) {
            Log::info("Generating reply", ['reply_type' => $campaign->reply_type]);
            $replyMessage = $this->generateReply($campaign, $commentText);
            
            Log::info("Reply generated", ['message' => $replyMessage]);
            
            if ($replyMessage) {
                $this->replyToComment($commentId, $replyMessage, $campaign, $page);
                $actions[] = 'replied';
                

            }
        }

        // Hide comment if enabled
        if ($campaign->hide_after_reply) {
            Log::info("Hiding comment");
            $this->hideComment($commentId, $page);
            $actions[] = 'hidden';
        }

        // Log the actions taken
        if (!empty($actions)) {
            Log::info("Logging actions", ['actions' => $actions]);
            $this->logAction(
                $campaign,
                $page,
                $commentId,
                $userId,
                $commentText,
                implode(',', $actions),
                $replyMessage
            );
        } else {
            Log::warning("No actions taken for comment");
        }
    }

    /**
     * Check if comment contains offensive keywords
     */
    protected function isOffensive(string $commentText, AutoReplyCampaign $campaign): bool
    {
        if (empty($campaign->offensive_keywords)) {
            return false;
        }

        $keywords = $campaign->getOffensiveKeywordsArray();
        $commentLower = strtolower($commentText);

        foreach ($keywords as $keyword) {
            $keyword = strtolower(trim($keyword));
            if (str_contains($commentLower, $keyword)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Handle offensive comment
     */
    protected function handleOffensiveComment(AutoReplyCampaign $campaign, string $commentId, FacebookPage $page, array $commentData)
    {
        Log::info("Offensive comment detected", ['comment_id' => $commentId]);

        // Delete the comment
        $this->deleteComment($commentId, $page);

        // Send private message if template is set
        if ($campaign->offensive_reply_template_id && isset($commentData['from']['id'])) {
            $userId = $commentData['from']['id'];
            $template = $campaign->offensiveReplyTemplate;
            
            if ($template) {
                $this->sendPrivateMessage($userId, $template->message, $page);
            }
        }
    }

    /**
     * Generate reply based on campaign type
     */
    protected function generateReply(AutoReplyCampaign $campaign, string $commentText): ?string
    {
        switch ($campaign->reply_type) {
            case 'generic':
                return $campaign->comment_reply_message;

            case 'filtered':
                return $this->getFilteredReply($campaign, $commentText);

            case 'ai':
                // TODO: Implement AI-based reply
                return $campaign->comment_reply_message ?: "Thank you for your comment!";

            default:
                return null;
        }
    }

    /**
     * Get reply based on keyword filtering
     */
    protected function getFilteredReply(AutoReplyCampaign $campaign, string $commentText): ?string
    {
        if (empty($campaign->filter_keywords)) {
            return $campaign->no_match_reply;
        }

        $keywords = $campaign->getFilterKeywordsArray();
        $commentLower = strtolower($commentText);
        $matched = false;

        foreach ($keywords as $keyword) {
            $keyword = strtolower(trim($keyword));
            
            if ($campaign->match_type === 'exact') {
                // Exact word match
                if (preg_match('/\b' . preg_quote($keyword, '/') . '\b/i', $commentText)) {
                    $matched = true;
                    break;
                }
            } else {
                // Any match (contains)
                if (str_contains($commentLower, $keyword)) {
                    $matched = true;
                    break;
                }
            }
        }

        return $matched ? $campaign->comment_reply_message : $campaign->no_match_reply;
    }

    /**
     * Reply to a comment
     */
    protected function replyToComment(string $commentId, string $message, AutoReplyCampaign $campaign, FacebookPage $page)
    {
        try {
            $accessToken = decrypt($page->access_token);
            
            $params = ['message' => $message];

            // Add media if provided
            if ($campaign->comment_reply_image) {
                $params['attachment_url'] = $campaign->comment_reply_image;
            }

            $response = $this->fb->api("/{$commentId}/comments", 'POST', $params, $accessToken);
            
            Log::info("Comment reply sent", [
                'comment_id' => $commentId,
                'response' => $response,
            ]);
        } catch (\Exception $e) {
            Log::error("Failed to reply to comment: " . $e->getMessage(), [
                'comment_id' => $commentId,
            ]);
        }
    }

    /**
     * Like a comment
     */
    protected function likeComment(string $commentId, FacebookPage $page)
    {
        try {
            $accessToken = decrypt($page->access_token);
            $this->fb->api("/{$commentId}/likes", 'POST', [], $accessToken);
            
            Log::info("Comment liked", ['comment_id' => $commentId]);
        } catch (\Exception $e) {
            Log::error("Failed to like comment: " . $e->getMessage());
        }
    }

    /**
     * Hide a comment
     */
    protected function hideComment(string $commentId, FacebookPage $page)
    {
        try {
            $accessToken = decrypt($page->access_token);
            $this->fb->api("/{$commentId}", 'POST', ['is_hidden' => true], $accessToken);
            
            Log::info("Comment hidden", ['comment_id' => $commentId]);
        } catch (\Exception $e) {
            Log::error("Failed to hide comment: " . $e->getMessage());
        }
    }

    /**
     * Delete a comment
     */
    protected function deleteComment(string $commentId, FacebookPage $page)
    {
        try {
            $accessToken = decrypt($page->access_token);
            $this->fb->api("/{$commentId}", 'DELETE', [], $accessToken);
            
            Log::info("Comment deleted", ['comment_id' => $commentId]);
        } catch (\Exception $e) {
            Log::error("Failed to delete comment: " . $e->getMessage());
        }
    }

    /**
     * Send private message to user (for offensive comment handling)
     * Returns true if message was sent successfully, false otherwise
     */
    protected function sendPrivateMessage(string $userId, string $message, FacebookPage $page): bool
    {
        try {
            $accessToken = decrypt($page->access_token);
            
            // Facebook Messenger has a 24-hour messaging window policy
            // We can only send messages to users who have messaged us within 24 hours
            // OR we need to use specific message tags for certain use cases
            
            $params = [
                'recipient' => ['id' => $userId],
                'message' => ['text' => $message],
                'messaging_type' => 'RESPONSE', // Standard response type
            ];
            
            $this->fb->api("/{$page->page_id}/messages", 'POST', $params, $accessToken);
            Log::info("Private message sent successfully", ['user_id' => $userId]);
            return true;
            
        } catch (\Exception $e) {
            // Log the error but don't fail the entire process
            Log::warning("Could not send private message (likely outside 24h window): " . $e->getMessage(), [
                'user_id' => $userId,
            ]);
            return false;
        }
    }

    /**
     * Log automation action
     */
    protected function logAction(
        AutoReplyCampaign $campaign,
        FacebookPage $page,
        string $commentId,
        string $userId,
        string $commentText,
        string $action,
        ?string $replyMessage = null,
        bool $wasOffensive = false
    ) {
        try {
            CommentAutomationLog::create([
                'auto_reply_campaign_id' => $campaign->id,
                'facebook_page_id' => $page->id,
                'comment_id' => $commentId,
                'user_id' => $userId,
                'comment_text' => $commentText,
                'action' => $action,
                'reply_message' => $replyMessage,
                'was_offensive' => $wasOffensive,
            ]);
        } catch (\Exception $e) {
            Log::error("Failed to log automation action: " . $e->getMessage());
        }
    }
}
