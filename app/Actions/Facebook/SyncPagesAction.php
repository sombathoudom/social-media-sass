<?php

namespace App\Actions\Facebook;

use App\Models\FacebookPage;
use App\Services\Facebook\FacebookService;
use Illuminate\Support\Facades\Log;

class SyncPagesAction
{
    public function __construct(
        protected FacebookService $fb
    ) {}

    public function execute($user, $isForce=false)
    {
        // Check if pages already exist for this user
        // This prevents unnecessary API calls to Facebook and avoids rate limits
        // Only fetch from Facebook API if:
        // 1. No pages exist in database (first-time sync)
        // 2. User explicitly clicks "Sync Pages" button ($isForce = true)

        if (FacebookPage::where('user_id', $user->id)->exists() && !$isForce) {
            return FacebookPage::where('user_id', $user->id)->get();
        }

        // Fetch pages from Facebook API
        $pages = $this->fb->getUserPages($user);

        foreach ($pages as $p) {
            FacebookPage::updateOrCreate(
                [
                    'user_id' => $user->id,
                    'page_id' => $p['id'],
                ],
                [
                    'name' => $p['name'],
                    'access_token' => encrypt($p['access_token']),
                ]
            );
        }

        return FacebookPage::where('user_id', $user->id)->get();
    }

    // public function execute($user)
    // {
    //     $pages = $this->fb->getUserPages($user);

    //     foreach ($pages as $p) {
    //         FacebookPage::updateOrCreate(
    //             [
    //                 'user_id' => $user->id,
    //                 'page_id' => $p['id'],
    //             ],
    //             [
    //                 'name' => $p['name'],
    //                 'access_token' => encrypt($p['access_token']),
    //             ]
    //         );
    //     }

    //     return FacebookPage::where('user_id', $user->id)->get();
    // }
}
