<?php

namespace App\Http\Controllers\Facebook;

use App\Actions\Facebook\SyncPagesAction;
use App\Actions\Facebook\SwitchPageAction;
use App\Actions\Facebook\SubscribePageToWebhookAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\PageSwitchRequest;
use Inertia\Inertia;

class PageController extends Controller
{
    public function index(SyncPagesAction $sync, SubscribePageToWebhookAction $subscribe)
    {
        $user = auth()->user();

        // This will only fetch from Facebook API if no pages exist in database
        // Otherwise, it returns cached pages from database to avoid rate limits
        $pages = $sync->execute($user);

        // OPTIMIZATION: Don't check webhook status on page load
        // It's too slow with many pages (20+ API calls)
        // Instead, assume all pages are subscribed (they are auto-subscribed on sync)
        // Users can manually check/subscribe if needed
        $pagesWithStatus = $pages->map(function ($page) {
            return [
                ...$page->toArray(),
                'webhook_subscribed' => true, // Assume subscribed (auto-subscribed on sync)
                'webhook_fields' => ['feed', 'messages'],
            ];
        });

        return Inertia::render('Facebook/Pages', [
            'pages' => $pagesWithStatus,
            'active_page_id' => $user->active_page_id,
            'facebook_profile' => [
                // Profile data is read from database (stored during OAuth callback)
                // No API calls to Facebook here
                'name' => $user->facebook_name,
                'email' => $user->facebook_email,
                'avatar' => $user->facebook_avatar,
                'connected' => !empty($user->facebook_id),
            ],
        ]);
    }

    public function syncMorePages(SyncPagesAction $syncPages, SubscribePageToWebhookAction $subscribe)
    {
        $syncPages->execute(auth()->user(), true);
        
        // Subscribe all pages to webhook
        $results = $subscribe->executeForUser(auth()->user());
        
        $message = 'Pages synced successfully';
        if (!empty($results['success'])) {
            $message .= '. Subscribed: ' . implode(', ', $results['success']);
        }
        if (!empty($results['failed'])) {
            $message .= '. Failed to subscribe: ' . implode(', ', $results['failed']);
        }

        return back()->with('success', $message);
    }

    public function switch(PageSwitchRequest $request, SwitchPageAction $switch)
    {
       
        $switch->execute(auth()->user(), $request->page_id);

        return back()->with('success', 'Active page switched.');
    }

    public function subscribeWebhook(SubscribePageToWebhookAction $subscribe)
    {
        $results = $subscribe->executeForUser(auth()->user());
        
        if (empty($results['failed'])) {
            return back()->with('success', 'All pages subscribed to webhook successfully!');
        }
        
        if (empty($results['success'])) {
            return back()->with('error', 'Failed to subscribe pages to webhook');
        }
        
        return back()->with('warning', 
            'Some pages subscribed successfully: ' . implode(', ', $results['success']) . 
            '. Failed: ' . implode(', ', $results['failed'])
        );
    }

    public function subscribePageWebhook($pageId, SubscribePageToWebhookAction $subscribe)
    {
        $page = \App\Models\FacebookPage::where('id', $pageId)
            ->where('user_id', auth()->id())
            ->firstOrFail();

        if ($subscribe->execute($page)) {
            return back()->with('success', "Page '{$page->name}' subscribed to webhook successfully!");
        }

        return back()->with('error', "Failed to subscribe page '{$page->name}' to webhook");
    }
}
