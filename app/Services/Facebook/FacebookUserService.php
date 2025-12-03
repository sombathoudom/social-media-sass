<?php

namespace App\Services\Facebook;

use App\Models\FacebookUser;
use Facebook\Facebook;

class FacebookUserService
{
    public function __construct(
        protected Facebook $fb
    ) {}

    public function sync(string $facebookId, string $pageAccessToken): FacebookUser
    {
        // 1. Fetch from Facebook API
        $response = $this->fb->get(
            "/$facebookId?fields=name,picture,gender,locale",
            $pageAccessToken
        );
        $profile = $response->getDecodedBody();

        // 2. Build avatar URL
        $avatar = $profile['picture']['data']['url'] ?? null;

        // 3. Store or update in DB
        return FacebookUser::updateOrCreate(
            ['facebook_id' => $facebookId],
            [
                'name'      => $profile['name'] ?? null,
                'avatar'    => $avatar,
                'gender'    => $profile['gender'] ?? null,
                'locale'    => $profile['locale'] ?? null,
                'synced_at' => now(),
            ]
        );
    }
}
